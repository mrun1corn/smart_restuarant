/// <reference types="vite/client" />

declare module "*.jsx" {
  import { ReactElement, JSXElementConstructor } from "react";
  const content: JSXElementConstructor<any>;
  export default content;
}
