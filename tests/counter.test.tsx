import { describe, expect, it } from "../dist";
import Counter from "./fixtures/Counter";

describe(Counter, (ctx) => {
  it("should render the component, displaying the items.", async () => {
    await expect.toSee("Counter Test");
    await expect.toSee("+");
    await expect.toSee("-");
    await expect.toSee("0");
  });

  it("the value of value should change if you click on the action buttons", async () => {
    ctx.click("+");
    await expect.toSee("1");
    ctx.click("+");
    await expect.toSee("2");
    ctx.click("+");
    await expect.toSee("3");
    ctx.click("-");
    await expect.toSee("2");
  });

  it("if value equal 0, it does not allow you to continue subtracting values ​from the value", async () =>{
    ctx.click("-")
    await expect.toSee("0")
  })
});
