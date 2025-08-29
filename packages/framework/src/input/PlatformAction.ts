import { KeyBindingAction } from "./KeyBindingAction";

export class PlatformAction extends KeyBindingAction
{
  public constructor(public readonly name: string)
  {
    super();
  }

  public static readonly Cut = new PlatformAction("Cut");
  public static readonly Copy = new PlatformAction("Copy");
  public static readonly Paste = new PlatformAction("Paste");
  public static readonly Delete = new PlatformAction("Delete");
  public static readonly SelectAll = new PlatformAction("SelectAll");
  public static readonly Save = new PlatformAction("Save");
  public static readonly Undo = new PlatformAction("Undo");
  public static readonly Redo = new PlatformAction("Redo");
  public static readonly Exit = new PlatformAction("Exit");
  public static readonly MoveToListStart = new PlatformAction("MoveToListStart");
  public static readonly MoveToListEnd = new PlatformAction("MoveToListEnd");
  public static readonly DocumentNew = new PlatformAction("DocumentNew");
  public static readonly DocumentPrevious = new PlatformAction("DocumentPrevious");
  public static readonly DocumentNext = new PlatformAction("DocumentNext");
  public static readonly DocumentClose = new PlatformAction("DocumentClose");
  public static readonly TabNew = new PlatformAction("TabNew");
  public static readonly TabRestore = new PlatformAction("TabRestore");

  public static readonly MoveBackwardChar = new PlatformAction("MoveBackwardChar");
  public static readonly MoveForwardChar = new PlatformAction("MoveForwardChar");
  public static readonly DeleteBackwardChar = new PlatformAction("DeleteBackwardChar");
  public static readonly DeleteForwardChar = new PlatformAction("DeleteForwardChar");
  public static readonly SelectBackwardChar = new PlatformAction("SelectBackwardChar");
  public static readonly SelectForwardChar = new PlatformAction("SelectForwardChar");

  public static readonly MoveBackwardWord = new PlatformAction("MoveBackwardWord");
  public static readonly MoveForwardWord = new PlatformAction("MoveForwardWord");
  public static readonly DeleteBackwardWord = new PlatformAction("DeleteBackwardWord");
  public static readonly DeleteForwardWord = new PlatformAction("DeleteForwardWord");
  public static readonly SelectBackwardWord = new PlatformAction("SelectBackwardWord");
  public static readonly SelectForwardWord = new PlatformAction("SelectForwardWord");

  public static readonly MoveBackwardLine = new PlatformAction("MoveBackwardLine");
  public static readonly MoveForwardLine = new PlatformAction("MoveForwardLine");
  public static readonly DeleteBackwardLine = new PlatformAction("DeleteBackwardLine");
  public static readonly DeleteForwardLine = new PlatformAction("DeleteForwardLine");
  public static readonly SelectBackwardLine = new PlatformAction("SelectBackwardLine");
  public static readonly SelectForwardLine = new PlatformAction("SelectForwardLine");

  public static readonly ZoomIn = new PlatformAction("ZoomIn");
  public static readonly ZoomOut = new PlatformAction("ZoomOut");
  public static readonly ZoomDefault = new PlatformAction("ZoomDefault");

  public isCommonTextEditingAction()
  {
    switch (this)
    {
    case PlatformAction.Cut:
    case PlatformAction.Copy:
    case PlatformAction.Paste:
    case PlatformAction.SelectAll:
    case PlatformAction.MoveBackwardChar:
    case PlatformAction.MoveForwardChar:
    case PlatformAction.MoveBackwardWord:
    case PlatformAction.MoveForwardWord:
    case PlatformAction.MoveBackwardLine:
    case PlatformAction.MoveForwardLine:
    case PlatformAction.DeleteBackwardChar:
    case PlatformAction.DeleteForwardChar:
    case PlatformAction.DeleteBackwardWord:
    case PlatformAction.DeleteForwardWord:
    case PlatformAction.DeleteBackwardLine:
    case PlatformAction.DeleteForwardLine:
    case PlatformAction.SelectBackwardChar:
    case PlatformAction.SelectForwardChar:
    case PlatformAction.SelectBackwardWord:
    case PlatformAction.SelectForwardWord:
    case PlatformAction.SelectBackwardLine:
    case PlatformAction.SelectForwardLine:
      return true;

    default:
      return false;
    }
  }
}
