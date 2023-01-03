import {createEditorState, EditorState} from "@/editor/state";
import {inject, InjectionKey, provide, reactive, ref, Ref, UnwrapRef} from "vue";
import {createHistory, History} from "@/editor/transaction/history";
import {transactional, untracked} from "@/editor/transaction/transactional";
import {HitObject} from "@/editor/state/hitobject";
import {TimingPoint} from "@/editor/state/timingPoint";
import {shortcuts, Shortcuts} from "@/editor/shortcuts/shortcuts";
import {loadSkin, Skin} from "@/editor/skin";
import {createHitSoundManager, HitSoundManager} from "@/editor/hitsounds";
import {createClock, EditorClock} from "@/editor/clock";
import {createCircle} from "@/editor/state/hitobject/circle";
import {Vector2} from "osu-classes";
import {ControlPointType, createSlider} from "@/editor/state/hitobject/slider";
import {importBeatmap} from "@/editor/import";

export const editorKey = Symbol('editor') as InjectionKey<EditorContext>;

export interface EditorContext {
    state: EditorState
    history: History
    currentTab: Ref<string>
    hitObjects: UnwrapRef<HitObject>[]
    timingPoints: TimingPoint[]
    shortcuts: Shortcuts
    skin: Skin
    hitSounds: HitSoundManager
    clock: EditorClock
}

export function createEditor() {
    const history = createHistory()

    const clock = createClock()

    const state = createEditorState(clock, history)

    const editor = {
        state,
        history,
        currentTab: ref('compose'),
        hitObjects: state.hitObjects.all,
        timingPoints: state.timing.timingPoints,
        shortcuts,
        skin: loadSkin(),
        hitSounds: createHitSoundManager(state.hitSounds),
        clock
    } as EditorContext

    provide(editorKey, editor);


    importBeatmap(editor)


    //
    // for (let i = 0; i < 10; i++) {
    //
    //     const hitObject = createCircle()
    //
    //     hitObject.position = new Vector2(100 + i * 20, 100 + i * 5)
    //     hitObject.startTime = 1000 + i * 50
    //
    //     editor.state.hitObjects.push(hitObject)
    // }
    //
    // const slider = createSlider()
    // slider.controlPoints = [
    //     {position: new Vector2(0, 0), kind: ControlPointType.PerfectCurve},
    //     {position: new Vector2(50, 25), kind: null},
    //     {position: new Vector2(100, 25), kind: null},
    // ]
    // slider.pixelLength = 100
    // slider.startTime = 0
    // slider.position = new Vector2(20, 30)
    //
    // editor.state.hitObjects.push(slider)
    //

    history.commit()

    return editor
}


export function useEditor() {
    return inject(editorKey)!
}

export function useHitObjects() {
    return useEditor().hitObjects
}
