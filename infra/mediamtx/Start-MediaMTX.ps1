[CmdletBinding()]
param(
    [string]$EnvFile,
    [string]$ConfigPath,
    [string]$BinaryPath,
    [switch]$Inert
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# $PSScriptRoot is empty inside param() defaults under Windows PowerShell 5.1,
# so defaults are resolved here in the script body instead.
if ([string]::IsNullOrWhiteSpace($EnvFile)) {
    $EnvFile = Join-Path $PSScriptRoot '.env'
}
if ([string]::IsNullOrWhiteSpace($ConfigPath)) {
    $ConfigPath = Join-Path $PSScriptRoot 'mediamtx.yml'
}
if ([string]::IsNullOrWhiteSpace($BinaryPath)) {
    $BinaryPath = Join-Path $PSScriptRoot 'dist\v1.20.1\runtime\mediamtx.exe'
}

function Get-RequiredEnvValue {
    param(
        [Parameter(Mandatory)] [hashtable]$Values,
        [Parameter(Mandatory)] [string]$Name
    )

    if (-not $Values.ContainsKey($Name) -or [string]::IsNullOrWhiteSpace($Values[$Name])) {
        throw "Missing required setting '$Name' in the protected environment file."
    }

    return $Values[$Name].Trim()
}

function Read-DeploymentEnvironment {
    param([Parameter(Mandatory)] [string]$Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "Environment file was not found. Create a protected .env from .env.example, or use -Inert for an offline local-publisher check."
    }

    $values = @{}
    $lineNumber = 0
    foreach ($line in [System.IO.File]::ReadLines($Path)) {
        $lineNumber++
        $trimmed = $line.Trim()
        if ($trimmed.Length -eq 0 -or $trimmed.StartsWith('#')) {
            continue
        }

        $separator = $trimmed.IndexOf('=')
        if ($separator -lt 1) {
            throw "Invalid environment-file entry at line $lineNumber. Use NAME=value format."
        }

        $name = $trimmed.Substring(0, $separator).Trim()
        $value = $trimmed.Substring($separator + 1).Trim()
        if ($name -notmatch '^[A-Z][A-Z0-9_]*$') {
            throw "Invalid environment variable name at line $lineNumber."
        }

        $values[$name] = $value
    }

    return $values
}

function Get-LocalIPv4Addresses {
    # All real (non-loopback, non-autoconfig) IPv4 addresses of this machine.
    # Announcing every one of them keeps the stack portable: any operator can
    # run it on their own machine without editing protected configuration.
    return @(Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
        Where-Object { $_.IPAddress -notmatch '^(127\.|169\.254\.)' } |
        ForEach-Object { $_.IPAddress } |
        Select-Object -Unique)
}

if (-not (Test-Path -LiteralPath $ConfigPath -PathType Leaf)) {
    throw "MediaMTX configuration file was not found."
}
if (-not (Test-Path -LiteralPath $BinaryPath -PathType Leaf)) {
    throw "MediaMTX executable was not found. Restore the checksum-verified v1.20.1 runtime or pass -BinaryPath."
}

$runtimeVariables = @(
    'MTX_PATHS_CAMERA1_SOURCE',
    'MTX_WEBRTCADDITIONALHOSTS',
    'MTX_WEBRTCALLOWORIGINS'
)

try {
    if (-not $Inert) {
        $deploymentValues = Read-DeploymentEnvironment -Path $EnvFile
        $cameraUrl = Get-RequiredEnvValue -Values $deploymentValues -Name 'CAMERA_RTSP_URL'
        if ($cameraUrl -notmatch '^rtsp://') {
            throw "CAMERA_RTSP_URL must use the rtsp:// scheme."
        }

        $localIps = Get-LocalIPv4Addresses
        if ($localIps.Count -eq 0) {
            throw 'No non-loopback IPv4 address was detected; set MEDIA_HOST explicitly in the protected .env.'
        }

        # MEDIA_HOST is optional: omitted or 'auto' announces every detected
        # local IPv4 so WebRTC works no matter which interface is in use.
        $mediaHost = if ($deploymentValues.ContainsKey('MEDIA_HOST')) { $deploymentValues['MEDIA_HOST'].Trim() } else { '' }
        if ($mediaHost -eq '' -or $mediaHost -eq 'auto') {
            $additionalHosts = $localIps -join ','
            Write-Host "MEDIA_HOST auto-detected: $additionalHosts"
        }
        else {
            if ($mediaHost -match '[/\\]' -or $mediaHost -match '://') {
                throw "MEDIA_HOST must be an IP address or hostname without a scheme, path, or port."
            }
            $additionalHosts = $mediaHost
        }

        # VUE_ORIGINS is optional: omitted derives allowed WHEP origins from
        # localhost plus every detected local IP (Vite dev ports 2355/5173/5174).
        $vueOrigins = if ($deploymentValues.ContainsKey('VUE_ORIGINS')) { $deploymentValues['VUE_ORIGINS'].Trim() } else { '' }
        if ($vueOrigins -eq '') {
            $originHosts = @('localhost', '127.0.0.1') + $localIps
            $originParts = foreach ($originHost in $originHosts) {
                foreach ($originPort in @('2355', '5173', '5174')) {
                    "http://${originHost}:${originPort}"
                }
            }
            Write-Host "VUE_ORIGINS auto-derived: $($originParts -join ',')"
        }
        else {
            $originParts = @($vueOrigins.Split(',', [System.StringSplitOptions]::RemoveEmptyEntries) | ForEach-Object { $_.Trim() })
            if ($originParts.Count -eq 0 -or @($originParts | Where-Object { $_ -notmatch '^https?://[^/]+$' }).Count -gt 0) {
                throw "VUE_ORIGINS must be a comma-separated list of http(s) origins without paths or trailing slashes."
            }
        }

        # The RTSP credential is only mapped to the child process and is never
        # written to stdout, errors, arguments, or the MediaMTX YAML file.
        $env:MTX_PATHS_CAMERA1_SOURCE = $cameraUrl
        $env:MTX_WEBRTCADDITIONALHOSTS = $additionalHosts
        $env:MTX_WEBRTCALLOWORIGINS = ($originParts -join ',')
    }

    Push-Location $PSScriptRoot
    try {
        if ($Inert) {
            Write-Host 'Starting MediaMTX in inert mode (no camera source is loaded).'
        }
        else {
            Write-Host 'Starting MediaMTX with protected runtime settings.'
        }
        & $BinaryPath $ConfigPath
        if ($LASTEXITCODE -ne 0) {
            throw "MediaMTX exited with code $LASTEXITCODE."
        }
    }
    finally {
        Pop-Location
    }
}
finally {
    foreach ($name in $runtimeVariables) {
        Remove-Item -Path "Env:$name" -ErrorAction SilentlyContinue
    }
}
