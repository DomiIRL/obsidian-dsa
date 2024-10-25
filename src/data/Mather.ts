export function evaluateExpression(value: string): number {
    // Teile den String in die Zahlen und die Operatoren auf
    let parts = value.split(/(\+|-|\*|\/)/).map(part => part.trim());

    // Beginne mit dem ersten Wert
    let current = parseFloat(parts[0]);

    // Iteriere durch die Teile und führe die Berechnung aus
    for (let i = 1; i < parts.length; i += 2) {
        let operator = parts[i];
        let nextValue = parseFloat(parts[i + 1]);

        // Führe die Berechnung basierend auf dem Operator durch
        if (operator === '-') {
            current -= nextValue;
        } else if (operator === '+') {
            current += nextValue;
        } else if (operator === '*') {
            current *= nextValue;
        } else if (operator === '/') {
            if (nextValue !== 0) {
                current /= nextValue;
            } else {
                throw new Error('Division by zero is not allowed.');
            }
        }
    }

    return current; // Gebe das Ergebnis zurück
}