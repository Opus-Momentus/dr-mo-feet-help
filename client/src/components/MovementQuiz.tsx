import React, { useState } from 'react';
import { ArrowRight, ArrowUpRight, RotateCcw } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

const movementAreas = [
  {
    name: 'Feet',
    text: 'Your feet meet the ground and adapt as you move. Foot comfort, footwear and individual foot function may be useful things to discuss with a professional.',
  },
  {
    name: 'Ankles',
    text: 'The ankles help your feet move through each step. If ankle pain or limited movement is affecting you, a clinician can assess what is relevant.',
  },
  {
    name: 'Knees',
    text: 'Your knees move in coordination with the rest of your legs. A change in how you walk can have many explanations, including pain or a change in activity.',
  },
  {
    name: 'Hips',
    text: 'The hips help support and control movement. Strength, mobility, comfort and your daily activities can all be part of a broader assessment.',
  },
  {
    name: 'Lower back',
    text: 'Back pain is common and can have many contributors. A qualified professional can help you understand your symptoms and discuss suitable next steps.',
  },
];

type QuizAnswers = {
  focus: 'heel-arch' | 'lower-back' | 'nerve-tingling' | 'both' | '';
  timing: 'morning' | 'standing' | 'walking' | 'sitting' | '';
  footwear: 'unsupportive' | 'worn-out' | 'unsure' | '';
};

function getQuizRecommendation(answers: QuizAnswers) {
  if (answers.focus === 'nerve-tingling' || answers.timing === 'sitting') {
    return {
      title: 'Explore the spine-to-foot nerve pathway',
      summary:
        'Tingling, burning, or symptoms that change when sitting can sometimes point to lumbar nerve irritation rather than a local foot injury alone.',
      articleSlug: '/resources/foot-pain-caused-by-your-spine-radiculopathy-vs-neuroma',
      articleLabel: 'Read: Spine vs. Foot Nerve Guide',
      practitionerType: 'Chiropractor',
      productTip: 'Ask a clinician before choosing insoles if you have numbness or radiating leg pain.',
    };
  }
  if (answers.focus === 'heel-arch' || answers.timing === 'morning') {
    return {
      title: 'Support your foundation from the first step',
      summary:
        'Morning heel soreness or arch fatigue during standing often responds well to supportive footwear, targeted arch support, and a biomechanical podiatry check.',
      articleSlug: '/resources/how-foot-problems-cause-lower-back-pain-solutions',
      articleLabel: 'Read: Foot Problems & Back Pain Solutions',
      practitionerType: 'Podiatrist',
      productTip: 'Consider podiatrist-designed orthotic innersoles for everyday walking shoes.',
    };
  }
  return {
    title: 'Assess your kinetic chain & daily load',
    summary:
      'When both your feet and lower back ache after standing or walking, shock absorption and alignment across ankles, knees, and hips are worth reviewing together.',
    articleSlug: '/resources/foot-alignment-and-lower-back-pain-kinetic-chain',
    articleLabel: 'Read: Foot Alignment & Kinetic Chain',
    practitionerType: 'Podiatrist',
    productTip: 'Pair cushioned, structured footwear with a gait assessment.',
  };
}

export function MovementMap() {
  const [mode, setMode] = useState<'quiz' | 'map'>('quiz');
  const [selected, setSelected] = useState(0);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    focus: '',
    timing: '',
    footwear: '',
  });

  const isComplete = step >= 3;
  const rec = isComplete ? getQuizRecommendation(answers) : null;

  function choose<K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    const nextStep = step + 1;
    setStep(nextStep);
    if (nextStep >= 3) {
      const result = getQuizRecommendation(next);
      trackEvent('movement_quiz_completed', {
        focus: next.focus,
        timing: next.timing,
        footwear: next.footwear,
        recommended_practitioner: result.practitionerType,
      });
    }
  }

  function resetQuiz() {
    setAnswers({ focus: '', timing: '', footwear: '' });
    setStep(0);
  }

  return (
    <div className="movement-map">
      <div className="movement-map-intro">
        <span className="card-kicker">INTERACTIVE SELF-CHECK</span>
        <h3>Connected, from the ground up.</h3>
        <p>
          Take a 30-second movement check to find the most relevant guide and practitioner type, or explore the 5-link body map.
        </p>
        <div className="movement-mode-switch" role="tablist" aria-label="Movement tool mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'quiz'}
            className={mode === 'quiz' ? 'active' : ''}
            onClick={() => setMode('quiz')}
          >
            30-second check
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'map'}
            className={mode === 'map' ? 'active' : ''}
            onClick={() => setMode('map')}
          >
            Body map
          </button>
        </div>
      </div>

      {mode === 'map' ? (
        <div className="movement-map-content">
          <div className="movement-tabs" aria-label="Explore areas of the body">
            {movementAreas.map((area, i) => (
              <button
                type="button"
                aria-pressed={selected === i}
                className={selected === i ? 'active' : ''}
                onClick={() => setSelected(i)}
                key={area.name}
              >
                {area.name}
              </button>
            ))}
          </div>
          <div className="movement-explainer">
            <span>0{selected + 1}</span>
            <div>
              <strong>{movementAreas[selected].name}</strong>
              <p>{movementAreas[selected].text}</p>
            </div>
            <ArrowUpRight size={17} />
          </div>
        </div>
      ) : (
        <div className="movement-map-content movement-quiz-box">
          {!isComplete ? (
            <>
              <div className="quiz-progress">
                <span>QUESTION {step + 1} OF 3</span>
                {step > 0 && (
                  <button type="button" className="quiz-reset-link" onClick={resetQuiz}>
                    <RotateCcw size={12} /> Start over
                  </button>
                )}
              </div>

              {step === 0 && (
                <div className="quiz-step">
                  <strong>Where do you notice discomfort most?</strong>
                  <div className="quiz-options">
                    <button type="button" onClick={() => choose('focus', 'heel-arch')}>
                      Heel, arch, or forefoot
                    </button>
                    <button type="button" onClick={() => choose('focus', 'lower-back')}>
                      Lower back stiffness or ache
                    </button>
                    <button type="button" onClick={() => choose('focus', 'both')}>
                      Both feet &amp; lower back
                    </button>
                    <button type="button" onClick={() => choose('focus', 'nerve-tingling')}>
                      Tingling, pins &amp; needles, or radiating pain
                    </button>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="quiz-step">
                  <strong>When is it most noticeable?</strong>
                  <div className="quiz-options">
                    <button type="button" onClick={() => choose('timing', 'morning')}>
                      First few steps in the morning
                    </button>
                    <button type="button" onClick={() => choose('timing', 'standing')}>
                      After standing on hard floors
                    </button>
                    <button type="button" onClick={() => choose('timing', 'walking')}>
                      During or after longer walks
                    </button>
                    <button type="button" onClick={() => choose('timing', 'sitting')}>
                      After sitting or bending forward
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="quiz-step">
                  <strong>How would you describe your everyday shoes?</strong>
                  <div className="quiz-options">
                    <button type="button" onClick={() => choose('footwear', 'unsupportive')}>
                      Flat, thin-soled, or minimal support
                    </button>
                    <button type="button" onClick={() => choose('footwear', 'worn-out')}>
                      More than 6–12 months old / uneven wear
                    </button>
                    <button type="button" onClick={() => choose('footwear', 'unsure')}>
                      Supportive, or I already wear insoles
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            rec && (
              <div className="quiz-result">
                <div className="quiz-progress">
                  <span>YOUR SUGGESTED NEXT STEP</span>
                  <button type="button" className="quiz-reset-link" onClick={resetQuiz}>
                    <RotateCcw size={12} /> Retake
                  </button>
                </div>
                <strong>{rec.title}</strong>
                <p>{rec.summary}</p>
                <p className="quiz-tip">{rec.productTip}</p>
                <div className="quiz-result-actions">
                  <a className="btn btn-dark" href={rec.articleSlug}>
                    {rec.articleLabel} <ArrowUpRight size={15} />
                  </a>
                  <a
                    className="btn btn-outline"
                    href={`/directory?type=${encodeURIComponent(rec.practitionerType)}`}
                  >
                    Find a {rec.practitionerType} <ArrowRight size={15} />
                  </a>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
