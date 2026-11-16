// UI Testing Context  
// Builds the object passed to describe(Component, (ctx) => ...).
// describe.tsx supplies the render function that knows the component + base props.

import { screen } from './render'
import { expect } from './expectations'
import * as actions from './actions'

export interface Ctx {
  render: (props?: Record<string, any>) => void
  fill: typeof actions.fill
  click: typeof actions.click
  type: typeof actions.type
  clear: typeof actions.clear
  select: typeof actions.select
  selectOptions: typeof actions.selectOptions
  check: typeof actions.check
  uncheck: typeof actions.uncheck
  press: typeof actions.press
  hover: typeof actions.hover
  unhover: typeof actions.unhover
  doubleClick: typeof actions.doubleClick
  rightClick: typeof actions.rightClick
  upload: typeof actions.upload
  screen: typeof screen
  expect: typeof expect
}

export function createContext(render: (props?: Record<string, any>) => void): Ctx {
  return {
    render,
    fill: actions.fill,
    click: actions.click,
    type: actions.type,
    clear: actions.clear,
    select: actions.select,
    selectOptions: actions.selectOptions,
    check: actions.check,
    uncheck: actions.uncheck,
    press: actions.press,
    hover: actions.hover,
    unhover: actions.unhover,
    doubleClick: actions.doubleClick,
    rightClick: actions.rightClick,
    upload: actions.upload,
    screen,
    expect,
  }
}
