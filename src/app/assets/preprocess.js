const forEachNode = (parent, selector, fn) => {
  parent.querySelectorAll(selector).forEach(fn);
};

const addClass = (parent, selector, ...classes) => {
  forEachNode(parent, selector, (elem) => {
    elem.classList.add(...classes);
  });
};
const removeClass = (parent, selector, ...classes) => {
  forEachNode(parent, selector, (elem) => {
    elem.classList.remove(...classes);
  });
};

const getParent = (elem, className) => {
  while (elem && elem.tagName !== "svg") {
    if (elem.classList.contains(className)) return elem;
    elem = elem.parentNode;
  }

  return null;
};

const isCell = (elem) => {
  return getParent(elem, "cell") != null;
};
const isEdge = (elem) => {
  return getParent(elem, "edge") != null;
};
const isNode = (elem) => {
  return getParent(elem, "node") != null;
};

const preprocessSVG = (svg) => {
  forEachNode(svg, "g.edge.modify-me path", (path) => {
    let re = /(-?\d+\.?\d+)/g;
    let d = path.attributes.d.value;

    let [
      mX, mY,
      x11, y11, x12, y12, x1, y1,
      x21, y21, x22, y22, x2, y2,
    ] = d.match(re).map(Number);

    x11 = (x11 - mX) / 4 + mX;
    x12 = (x12 - mX) / 4 + mX;
    x1 = (x1 - mX) / 4 + mX;

    x21 = (x21 - mX) / 4 + mX;
    x22 = (x22 - mX) / 4 + mX;

    y11 = (y11 + mY) / 2;
    y12 = (y12 + mY) / 2;

    y21 = (y21 + y2) / 2;
    y22 = (y22 + y2) / 2;

    let m = `M ${mX} ${mY}`;
    let c1 = `C ${x11} ${y11} ${x12} ${y12} ${x1} ${y1}`;
    let c2 = `C ${x21} ${y21} ${x22} ${y22} ${x2} ${y2}`;

    path.setAttribute("d", `${m} ${c1} ${c2}`);

    path.parentNode.classList.remove("modify-me");
  });

  forEachNode(svg, "g.edge path", (path) => {
    let newPath = path.cloneNode();
    newPath.classList.add("hover-path");
    newPath.removeAttribute("stroke-dasharray");
    path.parentNode.appendChild(newPath);
  });

  forEachNode(svg, "a", (a) => {
    let urlComps = a.href.baseVal.split(".");
    if (urlComps[0] != "remove_me_url") {
      return;
    }

    let docFrag = document.createDocumentFragment();
    docFrag.append(...a.childNodes);

    let g = a.parentNode;
    g.replaceChild(docFrag, a);
    g.id = g.id.replace(/^a_/, "");

    if (urlComps.length > 1) {
      g.classList.add(...urlComps.slice(1));
    }
  });

  forEachNode(svg, "g.edge", (edge) => {
    let [from, to] = edge.id.split(" -> ");

    edge.setAttribute("edge-from", from);
    edge.setAttribute("edge-to", to);
  });

  forEachNode(svg, "title", (el) => el.remove());
};

const onSelectEdge = (svg, target) => {
  let edge = getParent(target, "edge");
  let id = edge.id;

  let selectedEdgeID = svg.state.selectedEdgeID;
  if (selectedEdgeID == id) {
    svg.state.selectedEdgeID = null;
  } else {
    edge.classList.add("selected");
    addClass(svg, "g.edge:not(.selected)", "fade");

    svg.state.selectedEdgeID = id;
  }
};

const onSelectCell = (svg, target) => {
  let cell = getParent(target, "cell");
  if (!cell.classList.contains("fn")) {
    return;
  }

  let id = cell.id;

  let selectedCellID = svg.state.selectedCellID;
  if (selectedCellID == id) {
    svg.state.selectedCellID = null;
  } else {
    addClass(svg, `g.edge[edge-from="${id}"]`, "incoming");
    addClass(svg, `g.edge[edge-to="${id}"]`, "outgoing");
    addClass(svg, "g.edge:not(.incoming):not(.outgoing)", "fade");

    cell.classList.add("selected");
    svg.state.selectedCellID = id;
  }
};

const onSelectNode = (svg, target) => {
  let node = getParent(target, "node");
  let id = node.id;

  let selectedNodeID = svg.state.selectedNodeID;
  if (selectedNodeID == id) {
    svg.state.selectedNodeID = null;
  } else {
    addClass(svg, `g.edge[edge-from^="${id}"]`, "incoming");
    addClass(svg, `g.edge[edge-to^="${id}"]`, "outgoing");
    addClass(svg, "g.edge:not(.incoming):not(.outgoing)", "fade");

    node.classList.add("selected");

    svg.state.selectedNodeID = id;
  }
};

const reset = (svg) => {
  removeClass(svg, "g.cell.selected", "selected");
  removeClass(svg, "g.edge", "fade", "incoming", "outgoing", "selected");
  removeClass(svg, "g.node", "selected");
};

const addListeners = (svg) => {
  svg.addEventListener("mouseup", (event) => {
    reset(svg);

    let target = event.target;

    if (isEdge(target)) {
      onSelectEdge(svg, target);
    } else if (isCell(target)) {
      onSelectCell(svg, target);
    } else if (isNode(target)) {
      onSelectNode(svg, target);
    }
  });
};

let svg = document.querySelector("svg");
svg.state = {
  selectedCellID: null,
  selectedEdgeID: null,
  selectedNodeID: null,
};

preprocessSVG(svg);
addListeners(svg);
