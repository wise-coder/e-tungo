// Allow plain CSS side-effect imports
declare module "*.css";

// Allow SCSS side-effect imports
declare module "*.scss";

// Allow SVG imports
declare module "*.svg" {
  const content: React.FC<React.SVGProps<SVGSVGElement>>;
  export default content;
}
