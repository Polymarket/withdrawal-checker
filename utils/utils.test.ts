
import { USDCFormat } from ".";



describe("USDCFormat", () => {
    test("should return a number formated for display from a given number string", async function () {
        const num = "1000000000000";
        const displayNum = "$1,000,000.000000";
        expect(USDCFormat(num)).toBe(displayNum);
    });
});

