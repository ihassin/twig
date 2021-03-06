import { Attribute } from './attribute';
import { D3Node } from './node';

export interface Link {
  association?: string;
  attrs?: Array<Attribute>;
  central?: boolean;
  end_at?: string;
  hidden?: boolean;
  id: string;
  source: string | D3Node;
  sourceOriginal?: string;
  start_at?: string;
  target: string | D3Node;
  targetOriginal?: string;
}

export interface Links {
  data: Link[];
};
