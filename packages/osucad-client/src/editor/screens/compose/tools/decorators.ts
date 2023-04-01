

export function OnMouseMove() : MethodDecorator {
  return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    console.log(target, propertyKey, descriptor)
  }
}