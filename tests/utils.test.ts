import { expect } from "chai";
import { snakeCasify } from "../src/shared";
import { TEST_TYPES } from "./shared.test";

describe(`${TEST_TYPES.FUNCTION} snakeCasify`, () => {
    it("can snake casify something in camelCase", () => {
        expect(
            snakeCasify({
                somethingInCamelCase: "foo",
                whatElseShouldBeHere: null,
                thisIsACallForHelp: "baz",
            })
        ).to.deep.equal({
            something_in_camel_case: "foo",
            what_else_should_be_here: null,
            this_is_a_call_for_help: "baz",
        });
    });

    it("does nothing to objects already in snake case", () => {
        expect(
            snakeCasify({
                snake_case: true,
                ok_then: 1234,
            })
        ).to.deep.equal({
            snake_case: true,
            ok_then: 1234,
        });
    });

    it("can snake casify mixed objects", () => {
        expect(
            snakeCasify({
                camelCase: "foo",
                snake_case: "bar",
            })
        ).to.deep.equal({
            camel_case: "foo",
            snake_case: "bar",
        });
    });
});
