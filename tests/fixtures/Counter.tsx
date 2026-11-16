import { useState } from "react";

function Counter() {
  const [value, setValue] = useState(0);

  const add = (v: number) => setValue(v + 1);

  const sub = (v: number) => {
    if (v === 0) return;

    setValue(v - 1);
  };

  return (
    <>
      <title>Counter Test</title>
      <button onClick={() => add(value)}>+</button>
      <span>{value}</span>
      <button onClick={() => sub(value)}>-</button>
    </>
  );
}

export default Counter;
