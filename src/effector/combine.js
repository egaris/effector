//@flow

import type {Store} from './unit.h'
import {createStore} from './createUnit'
import {step, createStateRef, getStoreState, type StateRef} from './stdlib'
import {is} from './is'
import {unitObjectName} from './naming'
import {createLinkNode} from './forward'

//eslint-disable-next-line no-unused-vars
declare export function combine<State: $ReadOnlyArray<Store<any> | any>>(
  obj: State,
): Store<
  $TupleMap<
    State,
    //prettier-ignore
    <S>(field: Store<S> | S) => S,
  >,
>
declare export function combine<State: {-[key: string]: Store<any> | any, ...}>(
  obj: State,
): Store<
  $ObjMap<
    State,
    //prettier-ignore
    <S>(field: Store<S> | S) => S,
  >,
>
declare export function combine<R>(fn: () => R): Store<R>
declare export function combine<A, R>(a: Store<A>, fn: (a: A) => R): Store<R>
declare export function combine<A, B, R>(
  a: Store<A>,
  b: Store<B>,
  fn: (a: A, b: B) => R,
): Store<R>
declare export function combine<A, B, C, R>(
  a: Store<A>,
  b: Store<B>,
  c: Store<C>,
  fn: (a: A, b: B, c: C) => R,
): Store<R>
declare export function combine<A, B, C, D, R>(
  a: Store<A>,
  b: Store<B>,
  c: Store<C>,
  d: Store<D>,
  fn: (a: A, b: B, c: C, d: D) => R,
): Store<R>
declare export function combine<A, B, C, D, E, R>(
  a: Store<A>,
  b: Store<B>,
  c: Store<C>,
  d: Store<D>,
  e: Store<E>,
  fn: (a: A, b: B, c: C, d: D, e: E) => R,
): Store<R>
declare export function combine<A, B, C, D, E, F, R>(
  a: Store<A>,
  b: Store<B>,
  c: Store<C>,
  d: Store<D>,
  e: Store<E>,
  f: Store<F>,
  fn: (a: A, b: B, c: C, d: D, e: E, f: F) => R,
): Store<R>
declare export function combine<A, B, C, D, E, F, G, R>(
  a: Store<A>,
  b: Store<B>,
  c: Store<C>,
  d: Store<D>,
  e: Store<E>,
  f: Store<F>,
  g: Store<G>,
  fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => R,
): Store<R>
declare export function combine<A, B, C, D, E, F, G, H, R>(
  a: Store<A>,
  b: Store<B>,
  c: Store<C>,
  d: Store<D>,
  e: Store<E>,
  f: Store<F>,
  g: Store<G>,
  h: Store<H>,
  fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => R,
): Store<R>
declare export function combine<A, B, C, D, E, F, G, H, I, R>(
  a: Store<A>,
  b: Store<B>,
  c: Store<C>,
  d: Store<D>,
  e: Store<E>,
  f: Store<F>,
  g: Store<G>,
  h: Store<H>,
  i: Store<I>,
  fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I) => R,
): Store<R>
declare export function combine<A, B, C, D, E, F, G, H, I, J, R>(
  a: Store<A>,
  b: Store<B>,
  c: Store<C>,
  d: Store<D>,
  e: Store<E>,
  f: Store<F>,
  g: Store<G>,
  h: Store<H>,
  i: Store<I>,
  j: Store<J>,
  fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J) => R,
): Store<R>
declare export function combine<A, B, C, D, E, F, G, H, I, J, K, R>(
  a: Store<A>,
  b: Store<B>,
  c: Store<C>,
  d: Store<D>,
  e: Store<E>,
  f: Store<F>,
  g: Store<G>,
  h: Store<H>,
  i: Store<I>,
  j: Store<J>,
  k: Store<K>,
  fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J, k: K) => R,
): Store<R>

export function combine(...args: Array<Store<any>>): Store<any> {
  if (args.length === 0) throw Error('at least one argument required')
  let handler
  let stores
  let config
  if ('ɔ' in args[0]) {
    config = args[0].config
    args = args[0].ɔ
  }
  {
    const rawHandler = args[args.length - 1]
    if (typeof rawHandler === 'function') {
      stores = args.slice(0, -1)
      handler = rawHandler
    } else {
      stores = args
    }
  }

  let structStoreShape
  let shapeReady
  if (stores.length === 1) {
    const obj = stores[0]
    /*
      without edge case combine(Color, (Color) => '~')
      */
    if (!is.store(obj)) {
      /*
      case combine([R,G,B], ([R,G,B]) => '~')
      case combine({R,G,B}, ({R,G,B}) => '~')

      edge case combine([Color], ([Color]) => '~')
      edge case combine({Color}, ({Color}) => '~')

      edge case combine([R,G,B])
      edge case combine({R,G,B})

      edge case combine([Color])
      edge case combine({Color})
      */
      structStoreShape = obj
      shapeReady = true
    }
  }
  if (!shapeReady) {
    /*
    case combine(R,G,B, (R,G,B) => '~')
    */
    structStoreShape = stores
    /*
    without edge case combine(R,G,B)
    without edge case combine(Color)
    */
    if (handler) {
      handler = spreadArgs(handler)
    }
  }
  //$off
  const mergedStore = Array.isArray(structStoreShape)
    ? storeCombination(
      structStoreShape,
      list => list.slice(),
      [],
      config,
      handler,
    )
    : storeCombination(
      structStoreShape,
      obj => Object.assign({}, obj),
      {},
      config,
      handler,
    )
  return mergedStore
}

const spreadArgs = fn => list => fn(...list)

type CombinationScope = {
  key: any,
  target: StateRef,
  clone(value: any): any,
  isFresh: StateRef,
  ...
}

const storeCombination = (
  obj: any,
  clone: Function,
  defaultState: any,
  config?: string,
  fn?: Function,
) => {
  const stateNew = clone(defaultState)
  const store = createStore(stateNew, {
    name: config ? config : unitObjectName(obj),
  })
  const target = createStateRef(stateNew)
  const isFresh = createStateRef(true)
  const node = [
    step.check.defined(),
    step.mov({
      store: target,
      to: 'a',
    }),
    //prettier-ignore
    step.filter({
      fn: (upd, {key}, {a}) => upd !== a[key],
    }),
    step.mov({
      store: isFresh,
      to: 'b',
    }),
    step.compute({
      fn(upd, {clone, key}: CombinationScope, reg) {
        if (reg.b) {
          reg.a = clone(reg.a)
        }
        reg.a[key] = upd
      },
    }),
    step.mov({
      from: 'a',
      target,
    }),
    step.mov({
      from: 'value',
      store: false,
      target: isFresh,
    }),
    step.barrier({priority: 'barrier'}),
    step.mov({
      from: 'value',
      store: true,
      target: isFresh,
    }),
    step.mov({store: target}),
    fn && step.compute({fn}),
    step.check.changed({
      store: getStoreState(store),
    }),
  ]

  for (const key in obj) {
    const child = obj[key]
    if (!is.store(child)) {
      stateNew[key] = defaultState[key] = child
      continue
    }
    defaultState[key] = child.defaultState
    stateNew[key] = child.getState()
    createLinkNode(child, store, {
      scope: {key, clone},
      node,
      meta: {op: 'combine'},
    })
  }

  store.defaultShape = obj
  store.defaultState = fn
    ? (getStoreState(store).current = fn(stateNew))
    : defaultState
  return store
}
