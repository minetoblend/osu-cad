import {RefProperty} from "../util/RefProperty.ts";
import gsap from "gsap";

export class TimelineZoom {

  @RefProperty()
  zoom = 1;

  constructor() {
    const zoom = localStorage.getItem("timeline-zoom");
    if (zoom) {
      this.zoom = parseFloat(zoom);
    }
  }

  get visibleDuration() {
    return 4000 / this.zoom;
  }

  zoomIn() {
    this.setZoom(
      Math.min(this.zoom * 1.2, 4),
    );
  }

  zoomOut() {
    this.setZoom(
      Math.max(this.zoom / 1.2, 0.25),
    );
  }

  setZoom(zoom: number) {
    localStorage.setItem("timeline-zoom", zoom.toString());
    gsap.to(this, {
      zoom,
      duration: 0.25,
      ease: "power4.out",
    });
  }


}