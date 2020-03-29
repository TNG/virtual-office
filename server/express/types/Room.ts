import { Link } from "./Link";

export interface Room {
  id: string;
  name: string;
  joinUrl: string;
  links?: Link[];
  group?: string;
  icon?: string;
}
