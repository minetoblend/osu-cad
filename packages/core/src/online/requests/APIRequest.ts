export abstract class APIRequest<T = never> {
  protected constructor(
    protected readonly path: string,
    protected readonly method: string = 'GET',
    protected readonly authenticated = false,
  ) {
  }

  baseUrl!: string;

  protected body?: any;

  async execute(): Promise<T> {
    const url = this.baseUrl + this.path;

    const options: RequestInit = {
      method: this.method,
      credentials: this.authenticated ? 'include' : 'omit',
    };

    if (this.body) {
      options.body = JSON.stringify(this.body);
      options.headers = {
        'Content-Type': 'application/json',
      };
    }

    const response = await fetch(url, options);

    if (!response.ok)
      throw new Error(response.statusText);

    return response.json();
  }
}
