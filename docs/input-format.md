# Input package format

Each question is a directory containing exactly three JSON documents and the
audio files referenced by `voice.json`:

```text
input/Q01/
├── question.json
├── voice.json
├── timeline.json
└── audio/
    ├── Q01_01_question.mp3
    ├── Q01_02_svo.mp3
    ├── Q01_03_transform.mp3
    └── Q01_04_answer.mp3
```

All three documents must use the same `questionId`. The fixed stage order is:

```text
QUESTION -> THINK -> IDENTIFY_SVO -> TRANSFORM -> FINAL_ANSWER
```

## `question.json`

```json
{
  "questionId": "Q01",
  "questionNumber": 1,
  "topic": "Present Simple Passive",
  "active": {
    "fullSentence": "Doctors often check patients' blood pressure.",
    "subject": "Doctors",
    "adverb": "often",
    "verb": "check",
    "object": "patients' blood pressure"
  },
  "passive": {
    "subject": "Patients' blood pressure",
    "be": "is",
    "adverb": "often",
    "verbV3": "checked",
    "agent": "by doctors"
  },
  "grammar": {
    "subjectNumber": "singular",
    "beReason": "singular -> is",
    "verbTransformation": "check -> checked",
    "ruleLabel": "PRESENT SIMPLE PASSIVE",
    "rule": "S + am/is/are + V3/-ed + (by O)"
  },
  "finalAnswer": "Patients' blood pressure is often checked by doctors."
}
```

`active` and `passive` tokens are rendered independently. `finalAnswer` is
rendered exactly as supplied; the app does not reconstruct it.

## `voice.json`

```json
{
  "questionId": "Q01",
  "segments": [
    {
      "id": "QUESTION",
      "audio": "audio/Q01_01_question.mp3",
      "duration": 6.21,
      "subtitle": "Question one. Doctors often check patients' blood pressure."
    },
    {"id": "THINK", "audio": null, "duration": 4.0, "subtitle": null},
    {
      "id": "IDENTIFY_SVO",
      "audio": "audio/Q01_02_svo.mp3",
      "duration": 17.84,
      "subtitle": "First, identify the parts of the sentence."
    },
    {
      "id": "TRANSFORM",
      "audio": "audio/Q01_03_transform.mp3",
      "duration": 25.13,
      "subtitle": "Now transform the active sentence into the passive."
    },
    {
      "id": "FINAL_ANSWER",
      "audio": "audio/Q01_04_answer.mp3",
      "duration": 10.42,
      "subtitle": "The complete passive sentence is shown."
    }
  ]
}
```

MP3 files are supplied by the user. The declared `duration` is metadata and is
compared with the measured duration. The measured duration controls the global
timeline; a difference greater than 0.05 seconds is reported as a warning.
`THINK` must have `audio: null` and is intentionally silent. A non-null
`subtitle` is shown for the duration of its stage; use `null` to show no
subtitle.

## `timeline.json`

```json
{
  "questionId": "Q01",
  "segments": [
    {
      "segment": "QUESTION",
      "events": [
        {"at": 0, "action": "SHOW", "target": "active_subject"},
        {"at": 0, "action": "SHOW", "target": "active_adverb"},
        {"at": 0, "action": "SHOW", "target": "active_verb"},
        {"at": 0, "action": "SHOW", "target": "active_object"}
      ]
    },
    {"segment": "THINK", "events": [{"at": 1, "action": "SHOW", "target": "think_prompt"}]},
    {"segment": "IDENTIFY_SVO", "events": []},
    {"segment": "TRANSFORM", "events": []},
    {"segment": "FINAL_ANSWER", "events": []}
  ]
}
```

`at` is seconds relative to its segment. Supported actions are `SHOW`, `HIDE`,
`HIGHLIGHT`, `REVEAL_UNDERLINE`, `REVEAL_OUTLINE`, `MOVE_OBJECT`,
`CHANGE_VERB`, and `BUILD`. Targets must be valid passive-voice element IDs;
answer elements can only be revealed in `FINAL_ANSWER`, and THINK may only
control `think_prompt` and `countdown`.

## Validation and artifacts

Validation errors include the source file and JSON path and stop rendering
before `video.mp4` is written. Successful rendering writes the resolved global
timeline, a render manifest containing duration, FPS, resolution, audio count,
event count, and warnings, plus one PNG preview for each stage.
