export default function ValidationRuleGenerator({ label, max, patternType, min }) {
    let pattern = {}
    if (patternType === 'persianLetter') {
        pattern = { pattern: "[گچپژیلفقهمو ء-ي]", message: "فارسی وارد کنید" }
    }
    if (patternType === 'digit') {
        pattern = { pattern: "[0-9]", message: "عدد وارد کنید" }
    }
    return [
        {
            required: true,
            message: `وارد کردن ${label} الزامی است`
        },
        {
            max,
        },
        {
            min: min ?? 1
        },
        {
            whitespace: true,
        },
        pattern
    ]
}
