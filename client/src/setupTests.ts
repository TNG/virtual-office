import "@testing-library/jest-dom";

const reactDom = require("react-dom");
if (!reactDom.findDOMNode) {
  reactDom.findDOMNode = (component: any) => {
    if (component == null) return null;
    if (typeof component === "string") return document.getElementById(component);
    if (component.nodeType !== undefined) return component;
    if (component.ref?.current) return component.ref.current;
    return null;
  };
}
