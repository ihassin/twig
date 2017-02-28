export interface View {
  _id: String;
  collapsed_nodes: Array<String>;
  description: String;
  display_name: String;
  fixed_nodes: FixedNodes;
  link_types: ViewType;
  name: String;
  nav: ViewNav;
  node_types: ViewType;
}

export interface ViewType {

}

export interface FixedNodes {

}

export interface ViewNav {
  scale: String;
}

export interface Views {
  data: View[];
}
