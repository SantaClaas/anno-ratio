import { createSignal, untrack, type Signal } from "solid-js";

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type TimeString = `${Digit}${Digit}:${Digit}${Digit}`;
/**
 * There is probably a browser built-in API for this but I am too tired to search for it.
 */
function parseTimeToSeconds(timeString: TimeString) {
  const [minutes, seconds] = timeString.split(":").map(Number);
  return minutes * 60 + seconds;
}

type Fraction = { numerator: number; denominator: number };
function getFraction(numerator: number, denominator: number): Fraction {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const commonDivisor = gcd(numerator, denominator);
  return {
    numerator: numerator / commonDivisor,
    denominator: denominator / commonDivisor,
  };
}

function getRatio(
  minutes1: number,
  seconds1: number,
  minutes2: number,
  seconds2: number,
): number {
  const totalSeconds1 = minutes1 * 60 + seconds1;
  const totalSeconds2 = minutes2 * 60 + seconds2;
  return totalSeconds1 / totalSeconds2;
}

function Section({
  index,
  fraction: [fraction, setFraction],
}: {
  index: number;
  fraction: Signal<Fraction>;
}) {
  function handleChange(event: Event) {
    if (!(event.target instanceof HTMLInputElement))
      throw new Error("Target is expected to be an HTMLInputElement");
    const value = parseTimeToSeconds(event.target.value as TimeString);
    setFraction(getFraction(60, value));
  }

  return (
    <section>
      <label for={`time-${index}`}>
        <span>1 unit every </span>
        <input
          type="time"
          id={`time-${index}`}
          name={`time-${index}`}
          onChange={handleChange}
          value="01:00"
          step={30 * 60}
          class="border-stone-400 p-1 border rounded-lg"
        />
        <span> minutes</span>
      </label>
      <span> are </span>
      <output>
        <math>
          <mfrac>
            <mn class="font-sans">{fraction().numerator}</mn>
            <mn class="font-sans">{fraction().denominator}</mn>
          </mfrac>
        </math>
      </output>
      <span> units per minute</span>
    </section>
  );
}

function getFractionRatio(a: Fraction, b: Fraction): Fraction {
  /*
   * a1/a2 / b1/b2 = (a1 * b2) / (a2 * b1)
   */
  return {
    numerator: a.numerator * b.denominator,
    denominator: a.denominator * b.numerator,
  };
}

export default function App() {
  // Abusing hours as minutes and minutes as seconds

  const [fraction1, setFraction1] = createSignal<Fraction>(getFraction(60, 60));
  const [fraction2, setFraction2] = createSignal<Fraction>(getFraction(60, 60));

  function getLowestCommonMultiple(a: number, b: number): number {
    const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
    return (a * b) / gcd(a, b);
  }

  const fractionRatio = () => getFractionRatio(fraction1(), fraction2());

  return (
    <main class="content-center accent-emerald-300 justify-items-center h-dvh text-3xl space-y-4 font-semibold text-emerald-300">
      <h2>Building 1</h2>
      <Section index={1} fraction={[fraction1, setFraction1]} />
      <h2>Building 2</h2>
      <Section index={2} fraction={[fraction2, setFraction2]} />
      <p>You need {fractionRatio().denominator} of building 1</p>
      <p>You need {fractionRatio().numerator} of building 2</p>
    </main>
  );
}
