# PASSIVE VOICE QUESTION RENDERER — APP CONTEXT SPECIFICATION v1

## 0. Tài liệu này dùng để làm gì

Đây là context specification cho app code-renderer dùng để tạo video chữa bài tiếng Anh dạng:

**Active sentence → Present Simple Passive**

Mục tiêu v1 là render ổn định một nhóm câu cùng dạng với Q01, sau đó mới trừu tượng hóa để hỗ trợ các dạng bài khác.

Renderer phải hoạt động theo nguyên tắc **voice-first**:

```text
Question Data
    +
Voice Segments + Actual Durations
    +
Visual Timeline
    ↓
Passive Voice Renderer
    ↓
MP4 hoàn chỉnh
```

App không được khóa timing visual dựa trên thời lượng ước tính. Timing thực của audio là nguồn thời gian chính.

---

# 1. Phạm vi v1

## 1.1. Dạng bài hỗ trợ

Dạng duy nhất trong v1:

```text
Active sentence
→ Identify S / V / O / Adverb
→ Move Object
→ Choose Be
→ Convert Verb to V3/-ed
→ Rebuild Passive Sentence
→ Show Final Answer
→ Show Grammar Rule
```

Ví dụ chuẩn:

```text
Doctors often check patients' blood pressure.
↓
Patients' blood pressure is often checked by doctors.
```

## 1.2. Stage cố định

Renderer v1 có 5 stage:

```text
QUESTION
THINK
IDENTIFY_SVO
TRANSFORM
FINAL_ANSWER
```

Stage `TRANSFORM` có các sub-step:

```text
MOVE_OBJECT
CHOOSE_BE
USE_V3
BUILD_SENTENCE
ADD_ADVERB
ADD_AGENT
```

## 1.3. Không nằm trong phạm vi v1

Chưa cần:

- Multiple choice.
- Fill in the blank.
- Reading comprehension.
- Responsive cho nhiều aspect ratio.
- Word-level speech alignment tự động.
- UI editor hoàn chỉnh.
- Cloud render.
- Animation 3D / motion phức tạp.
- AI tự sáng tạo layout hoặc animation.

---

# 2. Nguồn sự thật của hệ thống

Renderer phải coi các nguồn sau là độc lập:

## 2.1. Content Source

Chứa nội dung ngữ pháp của câu:

- Active sentence.
- Subject.
- Adverb.
- Verb.
- Object.
- Passive subject.
- Be.
- Past participle.
- Agent.
- Final answer.
- Grammar rule.

## 2.2. Audio Source

Mỗi stage có audio độc lập:

```text
Qxx_01_question.mp3
Qxx_02_svo.mp3
Qxx_03_transform.mp3
Qxx_04_answer.mp3
```

THINK không có audio.

## 2.3. Timeline Source

Timeline quyết định:

```text
khi nào
+
element nào
+
action gì
+
animation gì
```

Renderer không tự suy luận lại nội dung giảng dạy từ audio.

---

# 3. Output bắt buộc

Renderer phải có khả năng xuất:

```text
output/
├── video.mp4
├── timeline_resolved.json
├── render_manifest.json
└── preview/
```

Tối thiểu:

- MP4 H.264.
- 1920 × 1080.
- 16:9.
- 30 fps.
- Có audio.
- Visual đồng bộ với audio.
- Không text overflow.
- Không element xuất hiện trước event của nó.

---

# 4. Canvas và Visual Theme v1

## 4.1. Canvas

```json
{
  "width": 1920,
  "height": 1080,
  "fps": 30,
  "background": "#FFFFFF"
}
```

## 4.2. Visual style

Phong cách:

- Clean.
- Modern.
- Educational.
- Nhiều khoảng trắng.
- Ưu tiên đọc rõ trên màn hình laptop và điện thoại.

## 4.3. Theme

Màu cơ bản:

```json
{
  "black": "#111111",
  "white": "#FFFFFF",
  "beige": "#D8B07A",
  "navy": "#0E2B47",
  "red": "#FF2A2A",
  "lightBlue": "#B8C9F0",
  "gray": "#BDBDBD",
  "answerText": "#7EC0FF"
}
```

Font:

```text
Title:
serif bold

Body:
Be Vietnam Pro
fallback Inter
fallback Arial

English sentence:
sans-serif, large, high readability
```

---

# 5. Layout chuẩn

Renderer v1 phải coi layout là template cố định.

## 5.1. Header

Góc trên trái:

```text
Câu {n}: Thì hiện tại đơn (bị động)
```

- Serif.
- Bold.
- Kích thước lớn.
- Không di chuyển giữa các stage.

Theme decoration:

- Beige corner line ở góc trên phải.
- Beige corner line ở góc dưới trái.

## 5.2. Active Sentence Region

Bên dưới title:

```text
Câu chủ động:
```

Câu active phải tách thành các layer riêng:

```text
subject
adverb
verb
object
```

Ví dụ:

```text
Doctors | often | check | patients' blood pressure
```

Không render active sentence thành một text node duy nhất.

## 5.3. S–V–O Analysis Region

Các marker:

```text
Subject → underline đỏ + S
Verb    → underline xanh nhạt + V
Object  → underline/outline beige + O
Adverb  → highlight nhẹ, không gắn S/V/O
```

Từng marker phải là element riêng.

## 5.4. Transformation Region

Nửa dưới slide:

Bên trái:

```text
Object
patients' blood pressure
```

Giữa:

```text
→
```

Bên phải:

```text
Passive Object / New Subject
Patients' blood pressure
```

Bên dưới hoặc gần transformation:

```text
singular → is
check → checked
```

## 5.5. Final Answer Region

Gần đáy bên phải:

Navy answer bar:

```text
✓ Patients' blood pressure is often checked by doctors.
```

Final Answer phải là group gồm:

```text
answer_box
answer_text
```

## 5.6. Grammar Rule Region

Có thể xuất hiện cùng FINAL ANSWER:

```text
PRESENT SIMPLE PASSIVE
S + am/is/are + V3/-ed + (by O)
```

---

# 6. Core Component Tree

App nên implement component tree tương tự:

```text
PassiveVoiceScene
│
├── ThemeDecoration
│
├── Header
│
├── ActiveSentence
│   ├── SubjectToken
│   ├── AdverbToken
│   ├── VerbToken
│   └── ObjectToken
│
├── SVOAnalysis
│   ├── SubjectUnderline
│   ├── SubjectLabel
│   ├── VerbUnderline
│   ├── VerbLabel
│   ├── ObjectUnderlineOrOutline
│   ├── ObjectLabel
│   └── AdverbHighlight
│
├── Transformation
│   ├── SourceObject
│   ├── MoveArrow
│   ├── PassiveSubject
│   ├── SingularNote
│   ├── BeToken
│   ├── VerbBase
│   ├── VerbV3
│   ├── AdverbToken
│   └── AgentToken
│
├── FinalAnswer
│   ├── AnswerBar
│   └── AnswerText
│
├── GrammarRule
├── SubtitleLayer
└── AudioLayer
```

---

# 7. Element ID Contract

ID phải ổn định để timeline gọi đúng element.

```text
title
active_label

active_subject
active_adverb
active_verb
active_object

underline_subject
underline_verb
underline_object

label_s
label_v
label_o

adverb_highlight

transform_object_source
transform_arrow
passive_subject

note_singular
be_token

verb_base
verb_v3

build_subject
build_be
build_adverb
build_v3
build_agent

answer_box
answer_text

grammar_rule_label
grammar_rule_text

think_prompt
countdown
```

Không đổi ID tùy câu.

---

# 8. Question Data Schema

## 8.1. JSON

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
    "beReason": "singular → is",
    "verbTransformation": "check → checked",
    "ruleLabel": "PRESENT SIMPLE PASSIVE",
    "rule": "S + am/is/are + V3/-ed + (by O)"
  },

  "finalAnswer": "Patients' blood pressure is often checked by doctors."
}
```

## 8.2. Rule

Question Data:

- Không chứa pixel position.
- Không chứa CSS.
- Không chứa animation duration.
- Không chứa absolute global timestamp.

Question Data chỉ mô tả **nội dung**.

---

# 9. Voice Metadata Schema

Sau khi TTS hoàn tất phải đo duration thật.

```json
{
  "questionId": "Q01",

  "segments": [
    {
      "id": "QUESTION",
      "audio": "04_audio/Q01_01_question.mp3",
      "duration": 6.21
    },
    {
      "id": "THINK",
      "audio": null,
      "duration": 4.0
    },
    {
      "id": "IDENTIFY_SVO",
      "audio": "04_audio/Q01_02_svo.mp3",
      "duration": 17.84
    },
    {
      "id": "TRANSFORM",
      "audio": "04_audio/Q01_03_transform.mp3",
      "duration": 25.13
    },
    {
      "id": "FINAL_ANSWER",
      "audio": "04_audio/Q01_04_answer.mp3",
      "duration": 10.42
    }
  ]
}
```

Renderer phải tính global start/end tự động.

Ví dụ:

```text
QUESTION
0.00 → 6.21

THINK
6.21 → 10.21

IDENTIFY_SVO
10.21 → 28.05

TRANSFORM
28.05 → 53.18

FINAL_ANSWER
53.18 → 63.60
```

---

# 10. Visual Timeline Schema

Visual timeline nên dùng thời gian **relative theo segment**.

Ví dụ:

```json
{
  "segment": "IDENTIFY_SVO",
  "events": [
    {
      "at": 0.0,
      "action": "SHOW",
      "target": "active_subject"
    },
    {
      "at": 3.2,
      "action": "REVEAL_UNDERLINE",
      "target": "underline_subject"
    },
    {
      "at": 3.35,
      "action": "SHOW",
      "target": "label_s"
    },
    {
      "at": 6.8,
      "action": "REVEAL_UNDERLINE",
      "target": "underline_verb"
    },
    {
      "at": 6.95,
      "action": "SHOW",
      "target": "label_v"
    },
    {
      "at": 10.6,
      "action": "REVEAL",
      "target": "underline_object"
    },
    {
      "at": 10.8,
      "action": "SHOW",
      "target": "label_o"
    },
    {
      "at": 14.2,
      "action": "HIGHLIGHT",
      "target": "active_adverb"
    }
  ]
}
```

Renderer resolve thành global timeline bằng:

```text
global_event_time
=
segment_global_start
+
event.at
```

---

# 11. State Machine

## 11.1. QUESTION

Mục tiêu:

- Giới thiệu câu.
- Chưa tiết lộ đáp án.

Visible:

```text
title
active_label
active_subject
active_adverb
active_verb
active_object
```

Optional:

```text
S = ?
V = ?
O = ?
```

Hidden:

```text
S/V/O markers
Transformation
Final answer
Grammar rule
```

## 11.2. THINK

Giữ active sentence.

Show:

```text
think_prompt
```

Text:

```text
Try it yourself.
Identify S – V – O.
```

Optional countdown:

```text
3 → 2 → 1
```

Không được reveal S/V/O.

## 11.3. IDENTIFY_SVO

Visual sync theo ý:

```text
Doctors
→ subject underline
→ S

check
→ verb underline
→ V

patients' blood pressure
→ object marker
→ O

often
→ light highlight
```

## 11.4. TRANSFORM

Sub-state order:

```text
MOVE_OBJECT
CHOOSE_BE
USE_V3
BUILD_SENTENCE
ADD_ADVERB
ADD_AGENT
```

### MOVE_OBJECT

```text
active_object
→ copy/move
→ passive_subject
```

### CHOOSE_BE

Show:

```text
singular
→ is
```

Highlight `is`.

### USE_V3

Show:

```text
check
→ checked
```

### BUILD_SENTENCE

Build theo layer:

```text
Patients' blood pressure
+
is
+
checked
```

### ADD_ADVERB

Insert:

```text
often
```

sau `is`.

### ADD_AGENT

Append:

```text
by doctors
```

## 11.5. FINAL_ANSWER

Show:

```text
answer_box
answer_text
```

Sau đó:

```text
grammar_rule_label
grammar_rule_text
```

Final answer chỉ được reveal khi FINAL ANSWER voice bắt đầu.

---

# 12. Animation Grammar v1

Chỉ hỗ trợ bộ animation nhỏ và deterministic.

## 12.1. Presets

```text
APPEAR
FADE_IN
FADE_UP
UNDERLINE_REVEAL
HIGHLIGHT
OUTLINE_REVEAL
MOVE_TO
REPLACE
BUILD_TOKEN
```

## 12.2. Default duration

```json
{
  "APPEAR": 0,
  "FADE_IN": 0.30,
  "FADE_UP": 0.35,
  "UNDERLINE_REVEAL": 0.35,
  "HIGHLIGHT": 0.25,
  "OUTLINE_REVEAL": 0.35,
  "MOVE_TO": 0.55,
  "REPLACE": 0.35,
  "BUILD_TOKEN": 0.25
}
```

## 12.3. Rule

AI không được chọn animation tùy ý.

Action → preset phải map cố định.

Ví dụ:

```text
SHOW             → FADE_IN
REVEAL_UNDERLINE → UNDERLINE_REVEAL
HIGHLIGHT        → HIGHLIGHT
MOVE_OBJECT      → MOVE_TO
CHANGE_VERB      → REPLACE
BUILD            → BUILD_TOKEN
```

---

# 13. Renderer Timing Rules

## 13.1. Voice là master

Nếu duration audio thay đổi:

```text
visual global timestamps phải resolve lại
```

Không sửa audio để ép theo visual.

## 13.2. Event relative time

Event nên nằm trong segment của nó.

Validation:

```text
0 <= event.at <= segment.duration
```

Nếu event vượt duration:

```text
render = fail
```

không silently clamp.

## 13.3. THINK

THINK có thể cấu hình:

```json
{
  "duration": 4.0
}
```

Không phụ thuộc audio.

## 13.4. Stage transition

Ưu tiên hard continuity hoặc fade rất nhẹ.

Không dùng flashy transition.

---

# 14. Audio Rules

- Mỗi voice segment là một file riêng.
- Trim silence thừa ở đầu audio trước khi sử dụng.
- Không concatenate audio trước khi resolve timeline.
- Renderer tự place audio theo segment.
- Có thể thêm gap nhỏ nếu spec yêu cầu.
- Audio English phải giữ phát âm rõ.

---

# 15. Subtitle Rules

Subtitle source lấy từ voice script.

Nguyên tắc:

- Voice tiếng Việt → subtitle tiếng Việt.
- Câu tiếng Anh → giữ English text.
- `patients'`, `blood pressure`, `checked` phải preserve đúng spelling.
- Subtitle không được che Final Answer hoặc Transformation region.
- Subtitle là layer riêng, không dùng chung với slide text.

v1 không cần ASR auto-caption nếu script đã có.

---

# 16. Text Layout Rules

Đây là phần bắt buộc để Q02–Q10 không làm vỡ renderer.

## 16.1. Auto measurement

Renderer phải đo actual text width.

Không hard-code khoảng cách token dựa trên Q01.

## 16.2. Active sentence

Layout horizontal:

```text
subject | adverb | verb | object
```

Có gap tối thiểu.

Nếu quá dài:

1. Giảm gap trong ngưỡng cho phép.
2. Giảm font size trong giới hạn.
3. Nếu vẫn overflow → chuyển sang two-line layout theo rule.
4. Không cắt text.

## 16.3. Font minimum

Không shrink dưới threshold định trước.

Ví dụ:

```text
Active sentence >= 34px
Final answer >= 28px
```

Nếu không fit → renderer báo validation error hoặc dùng fallback layout.

---

# 17. Suggested TypeScript Contracts

```ts
export type PassiveVoiceQuestion = {
  questionId: string;
  questionNumber: number;
  topic: string;

  active: {
    fullSentence: string;
    subject: string;
    adverb?: string;
    verb: string;
    object: string;
  };

  passive: {
    subject: string;
    be: string;
    adverb?: string;
    verbV3: string;
    agent?: string;
  };

  grammar: {
    subjectNumber: string;
    beReason: string;
    verbTransformation: string;
    ruleLabel: string;
    rule: string;
  };

  finalAnswer: string;
};
```

```ts
export type VoiceSegmentId =
  | "QUESTION"
  | "THINK"
  | "IDENTIFY_SVO"
  | "TRANSFORM"
  | "FINAL_ANSWER";

export type VoiceSegment = {
  id: VoiceSegmentId;
  audio: string | null;
  duration: number;
};
```

```ts
export type VisualAction =
  | "SHOW"
  | "HIDE"
  | "HIGHLIGHT"
  | "REVEAL_UNDERLINE"
  | "REVEAL_OUTLINE"
  | "MOVE_OBJECT"
  | "CHANGE_VERB"
  | "BUILD";

export type VisualEvent = {
  segment: VoiceSegmentId;
  at: number;
  action: VisualAction;
  target: string;
  payload?: Record<string, unknown>;
};
```

---

# 18. Suggested App Architecture

```text
src/
├── core/
│   ├── timeline/
│   │   ├── resolveTimeline.ts
│   │   └── validateTimeline.ts
│   │
│   ├── animation/
│   │   ├── presets.ts
│   │   └── interpolate.ts
│   │
│   ├── audio/
│   │   └── AudioTrack.tsx
│   │
│   ├── subtitles/
│   │   └── SubtitleLayer.tsx
│   │
│   └── layout/
│       ├── measureText.ts
│       └── fitText.ts
│
├── components/
│   ├── Text.tsx
│   ├── Underline.tsx
│   ├── Arrow.tsx
│   ├── Highlight.tsx
│   ├── AnswerBar.tsx
│   └── GrammarRule.tsx
│
├── question-types/
│   └── passive-voice/
│       ├── PassiveVoiceScene.tsx
│       ├── ActiveSentence.tsx
│       ├── SVOAnalysis.tsx
│       ├── Transformation.tsx
│       ├── FinalAnswer.tsx
│       ├── layout.ts
│       ├── defaults.ts
│       └── schema.ts
│
├── data/
│   ├── Q01.question.json
│   ├── Q01.voice.json
│   └── Q01.timeline.json
│
└── render/
    └── renderQuestion.ts
```

---

# 19. Render Pipeline

```text
1. Load question.json
2. Validate content schema
3. Load voice.json
4. Validate audio paths
5. Read actual duration / compare metadata
6. Resolve stage global times
7. Load timeline.json
8. Validate every event
9. Build scene state for each frame
10. Render visual
11. Add audio
12. Add subtitle
13. Export MP4
14. Save resolved timeline + manifest
```

---

# 20. Validation Rules

Render phải fail nếu:

- Thiếu subject.
- Thiếu verb.
- Thiếu object.
- Thiếu finalAnswer.
- Audio file bắt buộc không tồn tại.
- Duration <= 0.
- Event target không tồn tại.
- Event nằm ngoài segment.
- Text overflow nghiêm trọng.
- Final answer khác dữ liệu passive đã build mà không được explicit override.

Render có thể warning nếu:

- Agent rỗng.
- Adverb rỗng.
- Text phải shrink gần minimum.
- THINK duration quá ngắn.

---

# 21. QA tự động

Sau mỗi render cần tạo manifest:

```json
{
  "questionId": "Q01",
  "duration": 63.60,
  "fps": 30,
  "resolution": "1920x1080",
  "audioSegments": 4,
  "visualEvents": 22,
  "warnings": []
}
```

Các check:

```text
✓ Audio duration hợp lệ
✓ Event trong range
✓ Không missing target
✓ Final answer xuất hiện sau start FINAL_ANSWER
✓ S/V/O không xuất hiện trong QUESTION hoặc THINK
✓ Answer không xuất hiện trước FINAL_ANSWER
✓ Text không overflow
```

---

# 22. Data Example — Q01

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
    "beReason": "singular → is",
    "verbTransformation": "check → checked",
    "ruleLabel": "PRESENT SIMPLE PASSIVE",
    "rule": "S + am/is/are + V3/-ed + (by O)"
  },

  "finalAnswer": "Patients' blood pressure is often checked by doctors."
}
```

---

# 23. Mục tiêu kiểm chứng của v1

v1 chỉ được coi là thành công nếu:

```text
Q01 render hoàn chỉnh
        ↓
Q02–Q10 chỉ thay:
- question data
- voice files
- timeline cue

không phải sửa:
- layout engine
- animation engine
- component tree
- render pipeline
```

Nếu mỗi câu mới yêu cầu sửa CSS/position/code animation thì renderer chưa đạt mức tái sử dụng cần thiết.

---

# 24. Chiến lược mở rộng sau v1

Sau khi Passive Voice Renderer ổn định, tách kiến trúc thành:

```text
CORE VIDEO ENGINE
│
├── Timeline
├── Audio
├── Subtitle
├── Animation
├── Typography
├── Layout utilities
└── Render pipeline

QUESTION TYPE MODULES
│
├── PassiveVoice
├── MultipleChoice
├── FillBlank
├── Vocabulary
└── Reading
```

Core engine không chứa kiến thức ngữ pháp.

Question type module không tự quản lý render/export/audio low-level.

---

# 25. Nguyên tắc kiến trúc quan trọng

## 25.1. Content ≠ Layout

Không để question data chứa x/y.

## 25.2. Layout ≠ Timeline

Position không phụ thuộc thời điểm xuất hiện.

## 25.3. Timeline ≠ Animation Style

Timeline nói **khi nào**.

Animation preset nói **xuất hiện như thế nào**.

## 25.4. Voice là master clock

Visual theo voice, không ép voice theo visual.

## 25.5. Deterministic before creative

Renderer phải ưu tiên:

```text
ổn định
→ dễ kiểm tra
→ tái sử dụng
→ mới đến đẹp
```

Không để AI tự quyết animation trong runtime.

---

# 26. Definition of Done — Renderer v1

Renderer v1 hoàn thành khi:

- [ ] Nhận `question.json`.
- [ ] Nhận 4 voice file + THINK duration.
- [ ] Nhận `timeline.json`.
- [ ] Tự tính global timeline.
- [ ] Render đủ 5 stage.
- [ ] Render đúng active sentence thành các layer riêng.
- [ ] Reveal S/V/O đúng event.
- [ ] Thể hiện Object → Passive Subject.
- [ ] Thể hiện `singular → is`.
- [ ] Thể hiện `check → checked`.
- [ ] Build passive sentence.
- [ ] Show final answer đúng thời điểm.
- [ ] Show grammar rule.
- [ ] Có subtitle.
- [ ] Có audio.
- [ ] Export MP4 1920×1080 30 fps.
- [ ] Không text overflow.
- [ ] Có automatic validation.
- [ ] Q02–Q10 chạy mà không sửa renderer core.
