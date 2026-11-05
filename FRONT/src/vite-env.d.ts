/// <reference types="vite/client" />

// vite-plugin-mock 类型声明
declare module 'vite-plugin-mock' {
  export interface MockMethod {
    url: string;
    method?: 'get' | 'post' | 'put' | 'delete' | 'patch';
    response: ((opts: {
      query: Record<string, string>;
      body: Record<string, unknown>;
      headers: Record<string, string>;
    }) => unknown) | unknown;
    statusCode?: number;
    timeout?: number;
  }

  export function viteMockServe(options: {
    mockPath?: string;
    enable?: boolean;
    logger?: boolean;
    supportTs?: boolean;
  }): unknown;
}

// MockJS 类型声明
declare module 'mockjs' {
  const Mock: {
    mock(template: unknown): unknown;
    mock(url: string, method: string, template: unknown): unknown;
    Random: {
      integer(min: number, max: number): number;
      float(min: number, max: number, dmin?: number, dmax?: number): number;
      string(pool?: string, min?: number, max?: number): string;
      boolean(min?: number, max?: number, current?: boolean): boolean;
      date(format?: string): string;
      time(format?: string): string;
      datetime(format?: string): string;
      now(unit?: string, format?: string): string;
      image(size?: string, background?: string, foreground?: string, format?: string, text?: string): string;
      color(): string;
      hex(): string;
      rgb(): string;
      rgba(): string;
      hsl(): string;
      paragraph(min?: number, max?: number): string;
      sentence(min?: number, max?: number): string;
      word(min?: number, max?: number): string;
      title(min?: number, max?: number): string;
      cparagraph(min?: number, max?: number): string;
      csentence(min?: number, max?: number): string;
      cword(min?: number, max?: number): string;
      ctitle(min?: number, max?: number): string;
      first(): string;
      last(): string;
      name(middle?: boolean): string;
      cfirst(): string;
      clast(): string;
      cname(): string;
      url(): string;
      domain(): string;
      protocol(): string;
      tld(): string;
      email(): string;
      ip(): string;
      region(): string;
      province(): string;
      city(prefix?: boolean): string;
      county(prefix?: boolean): string;
      zip(): string;
      guid(): string;
      id(): string;
      increment(step?: number): number;
    };
    valid(template: unknown, data: unknown): unknown;
    toJSONSchema(template: unknown): unknown;
    heredoc(fn: () => void): string;
    setup(options: { timeout: number }): void;
    Handler: unknown;
    Util: unknown;
   heredoc: (fn: () => void) => string;
  };

  export default Mock;
}
