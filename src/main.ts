type Some<T> = { _type: "some"; value: T };
type Err = { _type: "err"; err: any };
type Options<T> = Some<T> | Err;

export class Result<T> {
  option: Options<T>;
  func: any;
  args: any;
  constructor(func: (...args: any[]) => T, ...args: any[]) {
    this.func = func;
    this.args = args;
    this.option = { _type: "err", err: "error" };
  }

  async run() {
    const Some = <T>(value: T): Some<T> => ({ _type: "some", value });
    try {
      const response = Some(await this.func(...this.args));
      this.option = response;
    } catch (e: any) {
      const err: Err = { _type: "err", err: e };
      this.option = err;
    }
    return this;
  }

  expect(message?: string) {
    if (this.option._type === "some" && !isNaN(Number(this.option.value))) {
      return this.option.value;
    } else if (
      this.option._type === "some" &&
      isNaN(Number(this.option.value))
    ) {
      if (message) {
        throw new Handler(new Error(""), message);
      }
      throw new Handler(new Error(""), "method return NaN");
    } else if (this.option._type === "err") {
      throw new Handler(this.option.err, message);
    } else {
      throw new Handler(new Error("Error with expect method"));
    }
  }

  unwrap() {
    if (this.option._type === "some" && !isNaN(Number(this.option.value))) {
      return this.option.value;
    } else {
      return null;
    }
  }
}

class Handler {
  constructor(error: any, message?: string) {
    const date_time = new Date().toDateString();
    const function_name = error.stack?.split("at ")[1]?.split(" ")[0];
    const line = error.stack?.split("at ")[1]?.split(":")[1];
    const file = error.stack
      ?.split("at ")[1]
      ?.split(":")[0]
      ?.split("(")[1]
      ?.trim();
    console.log(
      `Error: date_time: ${date_time} fuction: ${function_name} line ${line} file: ${file}`,
    );
    console.log(`Message: ${message || error.message}`);
    throw new Error(message || error.message);
    // process.exit(1);
  }
}

import test from "node:test";
import * as assert from "node:assert";
const sum = (a: number, b: number) => Number(a) + b;

test("should return null using unwarp", async () => {
  const result = (await new Result(sum, "e", 2).run()).unwrap();
  assert.strictEqual(result, null);
});

test("should trow error with expect message", async () => {
  try {
    //prettier-ignore
    const result = (await new Result(sum, "e", 2).run()).expect("Error with sum method");
  } catch (e: any) {
    assert.strictEqual(e.message, "Error with sum method");
  }
});

test("Should work fine with unwarp", async () => {
  const result = (await new Result(sum, 2, 2).run()).unwrap();
  assert.strictEqual(result, 4);
});

test("Should work fine with expect", async () => {
  //prettier-ignore
  const result = (await new Result(sum, 2, 2).run()).expect("Error with sum method");
  assert.strictEqual(result, 4);
});
