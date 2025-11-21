/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
/** biome-ignore-all lint/a11y/noSvgWithoutTitle: <explanation> */
import { createSignal, Show, type Signal } from "solid-js";

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

    set(event.target.value as TimeString);
  }

  function set(value: TimeString) {
    const demoninator = parseTimeToSeconds(value);
    setFraction(getFraction(60, demoninator));
  }

  let input: HTMLInputElement | undefined;

  return (
    <section class="flex items-center">
      <label for={`time-${index}`}>
        <span>1 unit every </span>
      </label>
      <input
        type="time"
        id={`time-${index}`}
        name={`time-${index}`}
        onChange={handleChange}
        value="01:00"
        step={30 * 60}
        ref={input}
        onInput={() => console.debug("test")}
        class="border-stone-400 p-2 border rounded-s-lg h-12 ml-[1ch]"
      />
      <Show when={input?.stepUp}>
        <button
          onClick={() => {
            input?.stepUp();
            input?.dispatchEvent(new Event("change"));
          }}
          class="border-stone-400 p-2 border size-12 justify-items-center touch-manipulation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="block"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          <span class="sr-only">Increase</span>
        </button>
      </Show>
      <Show when={input?.stepDown}>
        <button
          onClick={() => {
            input?.stepDown();
            input?.dispatchEvent(new Event("change"));
          }}
          class="border-stone-400 p-2 border size-12 rounded-e-lg justify-items-center touch-manipulation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="block"
          >
            <path d="M5 12h14" />
          </svg>
          <span class="sr-only">Decrease</span>
        </button>
      </Show>
      <span class="ml-[1ch]">minutes are</span>
      <output class="ml-[1ch]">
        <math>
          <mfrac>
            <mn class="font-sans">{fraction().numerator}</mn>
            <mn class="font-sans">{fraction().denominator}</mn>
          </mfrac>
        </math>
      </output>
      <span class="ml-[1ch]">units per minute</span>
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

  const fractionRatio = () => getFractionRatio(fraction1(), fraction2());

  return (
    <main class="content-center accent-emerald-300 justify-items-center h-dvh text-lg space-y-4 font-semibold text-emerald-300">
      <h2>Building 1</h2>
      <Section index={1} fraction={[fraction1, setFraction1]} />
      <h2>Building 2</h2>
      <Section index={2} fraction={[fraction2, setFraction2]} />
      <p>You need {fractionRatio().denominator} of building 1</p>
      <p>You need {fractionRatio().numerator} of building 2</p>
    </main>
  );
}
