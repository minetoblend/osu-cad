type SummaryObject = ISummaryTree | ISummaryBlob | ISummaryHandle;

export interface ISummaryTree {
  type: 'tree';
  tree: { [key: string]: SummaryObject };
}

export interface ISummaryBlob {
  type: 'blob';
  contents: string;
  encoding: 'base64' | 'utf-8';
}

export interface ISummaryHandle {
  type: 'handle';
  ref: string;
}
