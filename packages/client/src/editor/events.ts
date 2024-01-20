import {useEditor} from "./editorClient.ts";
import {Ref, VNode} from "vue";


export function createEventList(): EditorEventsList {
  const events = ref<Event[]>([]);

  let nextId = 0;

  function addEvent(event: Omit<Event, "id">) {
    const id = nextId++;
    events.value.unshift({ ...event, id });
    setTimeout(() => {
      events.value.splice(events.value.findIndex(s => s.id === id), 1);
    }, 10_000);
  }

  return { events, add: addEvent };
}

export function useEvents() {
  return useEditor().events;
}

export interface Event {
  id: number;
  message: string;
  render?: () => VNode[];
}

export interface EditorEventsList {
  events: Ref<Event[]>;
  add: (event: Omit<Event, "id">) => void;
}