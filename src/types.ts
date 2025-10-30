---
interface Metadata {
  title: string;
  url: string;
  language: string;
  description: string;
  author: {
    name: string;
    email: string;
    url: string;
  };
}

export type { Metadata };
