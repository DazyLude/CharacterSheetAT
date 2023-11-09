import { memo } from "react";

import { GridElement } from "./GridElements/element";
import { GridController } from "./GridElements/controller";
import { GhostController } from "./GridElements/ghost";

// memoized version of gridElement
// prevents rerenders when parents are updated
export const GridElementMemo = memo(GridElement);
export { GridController, GhostController };