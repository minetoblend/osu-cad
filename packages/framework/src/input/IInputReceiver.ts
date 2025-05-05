import type { ClickEvent } from "./events/ClickEvent";
import type { DoubleClickEvent } from "./events/DoubleClickEvent";
import type { DragEndEvent } from "./events/DragEndEvent";
import type { DragEvent } from "./events/DragEvent";
import type { DragStartEvent } from "./events/DragStartEvent";
import type { DropEvent } from "./events/DropEvent";
import type { FocusEvent } from "./events/FocusEvent";
import type { FocusLostEvent } from "./events/FocusLostEvent";
import type { HoverEvent } from "./events/HoverEvent";
import type { HoverLostEvent } from "./events/HoverLostEvent";
import type { KeyDownEvent } from "./events/KeyDownEvent";
import type { KeyUpEvent } from "./events/KeyUpEvent";
import type { MouseDownEvent } from "./events/MouseDownEvent";
import type { MouseMoveEvent } from "./events/MouseMoveEvent";
import type { MouseUpEvent } from "./events/MouseUpEvent";
import type { ScrollEvent } from "./events/ScrollEvent";
import type { TouchDownEvent } from "./events/TouchDownEvent";
import type { TouchMoveEvent } from "./events/TouchMoveEvent";
import type { TouchUpEvent } from "./events/TouchUpEvent";

export interface IInputReceiver 
{
  onMouseMove?: (e: MouseMoveEvent) => boolean;
  onHover?: (e: HoverEvent) => boolean;
  onMouseDown?: (e: MouseDownEvent) => boolean;
  onMouseUp?: (e: MouseUpEvent) => void;
  onClick?: (e: ClickEvent) => boolean;
  onDoubleClick?: (e: DoubleClickEvent) => boolean;
  onHoverLost?: (e: HoverLostEvent) => void;
  onDragStart?: (e: DragStartEvent) => boolean;
  onDrag?: (e: DragEvent) => boolean;
  onDragEnd?: (e: DragEndEvent) => void;
  onScroll?: (e: ScrollEvent) => boolean;
  onFocus?: (e: FocusEvent) => void;
  onFocusLost?: (e: FocusLostEvent) => void;
  onKeyDown?: (e: KeyDownEvent) => boolean;
  onKeyUp?: (e: KeyUpEvent) => void;
  onTouchMove?: (e: TouchMoveEvent) => boolean;
  onTouchDown?: (e: TouchDownEvent) => boolean;
  onTouchUp?: (e: TouchUpEvent) => void;
  onDrop?: (e: DropEvent) => boolean;
}
