import { expect } from "chai";
import { hyphenCasify, snakeCasify } from "../src/shared";
import { TEST_TYPES } from "./shared.test";

describe(`${TEST_TYPES.FUNCTION} snakeCasify`, () => {
    it("can snake-casify something in camel case", () => {
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

    it("can snake-casify mixed objects", () => {
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

    it("doesn't break when there's non-alphanumeric characters", () => {
        expect(
            snakeCasify({
                "somethingInCamelCase.123": "foo",
                "whatElseShouldBeHere.456": null,
                "thisIsACallForHelp.789": "baz",
            })
        ).to.deep.equal({
            "something_in_camel_case.123": "foo",
            "what_else_should_be_here.456": null,
            "this_is_a_call_for_help.789": "baz",
        });
    });
});

describe(`${TEST_TYPES.FUNCTION} hyphenCasify`, () => {
    it("can hyphen-casify something in camel case", () => {
        expect(
            hyphenCasify({
                somethingInCamelCase: "foo",
                whatElseShouldBeHere: null,
                thisIsACallForHelp: "baz",
            })
        ).to.deep.equal({
            "something-in-camel-case": "foo",
            "what-else-should-be-here": null,
            "this-is-a-call-for-help": "baz",
        });
    });

    it("does nothing to objects already in hyphen case", () => {
        expect(
            hyphenCasify({
                "hyphen-case": true,
                "ok-then": 1234,
            })
        ).to.deep.equal({
            "hyphen-case": true,
            "ok-then": 1234,
        });
    });

    it("can hyphen-casify mixed objects", () => {
        expect(
            hyphenCasify({
                camelCase: "foo",
                "hyphen-case": "bar",
            })
        ).to.deep.equal({
            "camel-case": "foo",
            "hyphen-case": "bar",
        });
    });

    it("doesn't break when there's non-alphanumeric characters", () => {
        expect(
            hyphenCasify({
                "somethingInCamelCase.123": "foo",
                "whatElseShouldBeHere.456": null,
                "thisIsACallForHelp.789": "baz",
            })
        ).to.deep.equal({
            "something-in-camel-case.123": "foo",
            "what-else-should-be-here.456": null,
            "this-is-a-call-for-help.789": "baz",
        });
    });
});
