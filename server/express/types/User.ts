export interface User {
  type?: "slack" | "zoom";
  id: string;
  imageUrl?: string;
  name: string;
  email?: string;
}
