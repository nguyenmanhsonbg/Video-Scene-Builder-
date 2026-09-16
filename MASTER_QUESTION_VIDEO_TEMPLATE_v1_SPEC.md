# MASTER QUESTION VIDEO TEMPLATE v1

## Câu 1 · Present Simple Passive

## 1. Mục đích tài liệu

Tài liệu này đặc tả quy trình tạo video chữa một câu bài tập tiếng Anh theo mô hình **voice-first**. Câu 1 được dùng làm mẫu chuẩn để kiểm chứng toàn bộ luồng trước khi nhân rộng cho Q02–Q10.

Mục tiêu của template:

- Chuẩn hóa cách phân tích và chữa một câu.
- Tách nội dung thành các trạng thái hình ảnh rõ ràng.
- Dùng voice làm timeline chính; visual xuất hiện theo nội dung voice.
- Cho phép tái sử dụng bố cục, màu sắc, font và cách chuyển đổi câu.
- Tạo nền tảng cho việc tự động hóa sau khi prototype ổn định.

---

## 2. Phạm vi của template

### Dữ liệu nguồn

**Active sentence:**

> Doctors often check patients' blood pressure.

### Phân tích câu

- Subject (S): `Doctors`
- Adverb: `often`
- Verb (V): `check`
- Object (O): `patients' blood pressure`

### Quy tắc bị động

> S + am/is/are + V3/-ed + (by O)

### Kết quả chuyển đổi

- Đưa `patients' blood pressure` lên làm chủ ngữ mới.
- `patients' blood pressure` là số ít nên dùng `is`.
- `check` chuyển sang quá khứ phân từ là `checked`.
- Giữ trạng từ `often` sau động từ `be`.

**Final answer:**

> Patients' blood pressure is often checked by doctors.

---

## 3. Nguyên tắc vận hành

### 3.1. Voice là master timeline

Thứ tự thực hiện bắt buộc:

```text
Script
  ↓
Voice từng segment
  ↓
Thời lượng voice thực tế
  ↓
Visual state tương ứng
  ↓
Đồng bộ trong CapCut
  ↓
Subtitle và animation
  ↓
Video hoàn chỉnh
```

Không khóa timing visual trước khi tạo voice. Khi voice thay đổi, visual phải được điều chỉnh theo voice.

### 3.2. Nội dung động và template cố định

**Nội dung động theo từng câu:**

- Question
- Subject
- Verb
- Object
- Adverb
- Be
- V3/-ed
- Final answer
- Voice
- Duration

**Thành phần cố định:**

- Bố cục
- Font
- Hệ màu
- Các visual state
- Cách đánh dấu S/V/O
- Ngôn ngữ animation
- Transition
- Cấu trúc thư mục và tên file

Nguyên tắc tổng quát:

> Nội dung thay đổi, thiết kế giữ ổn định.

---

## 4. Cấu trúc master slide

Canvas thiết kế:

- Kích thước: `1920 × 1080 px`
- Tỉ lệ: `16:9`
- Phong cách: clean, modern, educational, dễ đọc trên video
- Font ưu tiên: `Be Vietnam Pro`; fallback `Inter` hoặc `Arial`

Master slide chứa các vùng cố định:

1. Header
2. Active Sentence
3. S–V–O Analysis
4. Passive Transformation
5. Final Answer
6. Grammar Rule

Các từ hoặc cụm từ cần animation phải được tách thành layer riêng, đặc biệt:

- `Doctors`
- `often`
- `check`
- `patients' blood pressure`
- `is`
- `checked`
- `by doctors`

---

## 5. Quy trình chữa câu gồm 5 stage

### Stage 1 — QUESTION

**Mục tiêu:**

- Giới thiệu câu hỏi.
- Cho học sinh đọc câu chủ động.
- Chưa tiết lộ lời giải.

**Visual hiển thị:**

```text
QUESTION 1

Doctors often check patients' blood pressure.

S = ?    V = ?    O = ?
```

**Voice segment:** `Q01_01_question.mp3`

**Voice script:**

> Câu 1. Doctors often check patients' blood pressure.

**Điều kiện chuyển stage:** Voice đọc câu hỏi kết thúc.

---

### Stage 2 — THINK

**Mục tiêu:**

- Tạo thời gian để học sinh tự xác định S–V–O.
- Tránh hiển thị đáp án quá sớm.

**Visual hiển thị:**

- Giữ nguyên câu chủ động.
- Hiển thị `Identify S – V – O` hoặc `Try it yourself`.
- Có thể thêm countdown `3 → 2 → 1` khi dựng video.

**Voice:** Không có.

**Thời lượng đề xuất:** `3–5 giây`.

**Điều kiện chuyển stage:** Hết khoảng THINK.

---

### Stage 3 — IDENTIFY S–V–O

**Mục tiêu:**

- Xác định cấu trúc câu chủ động.
- Chuẩn bị dữ liệu cho bước chuyển sang câu bị động.

**Visual hiển thị:**

- `Doctors`: Subject (S), đánh dấu bằng một gạch dưới.
- `check`: Verb (V), đánh dấu bằng hai gạch dưới.
- `patients' blood pressure`: Object (O), khoanh tròn hoặc dùng rounded outline.
- `often`: Adverb, giữ nguyên và không gắn nhãn S/V/O.

**Voice segment:** `Q01_02_svo.mp3`

**Voice script:**

> Trước tiên, chúng ta xác định các thành phần của câu. “Doctors” là chủ ngữ. “Check” là động từ. Và “patients' blood pressure” là tân ngữ.

**Yêu cầu đồng bộ:**

- Khi voice nói `Doctors`, marker S phải xuất hiện hoặc được highlight.
- Khi voice nói `check`, marker V phải xuất hiện hoặc được highlight.
- Khi voice nói `patients' blood pressure`, marker O phải xuất hiện hoặc được highlight.

---

### Stage 4 — TRANSFORM

**Mục tiêu:** Cho học sinh nhìn thấy quá trình chuyển đổi, không chỉ nhìn đáp án cuối.

#### Bước 4.1 — Move Object

```text
patients' blood pressure
        ↓
Patients' blood pressure
        ↓
New Subject
```

#### Bước 4.2 — Choose Be

```text
patients' blood pressure
        ↓
singular
        ↓
is
```

#### Bước 4.3 — Use V3

```text
check
  ↓
V3
  ↓
checked
```

#### Bước 4.4 — Build Line

```text
Patients' blood pressure + is + checked
```

Khi dựng animation có thể bổ sung `often` và `by doctors` vào đúng vị trí để hoàn thiện câu.

**Voice segment:** `Q01_03_transform.mp3`

**Voice script:**

> Khi chuyển sang câu bị động, đưa tân ngữ “patients' blood pressure” lên đầu câu. Cụm này là số ít, vì vậy chúng ta dùng “is”. Động từ “check” chuyển sang dạng quá khứ phân từ là “checked”.

**Yêu cầu đồng bộ:**

- Hiển thị chuyển động O → Passive Subject khi voice giải thích đưa tân ngữ lên đầu.
- Highlight `is` khi voice nói cụm này là số ít.
- Highlight `checked` khi voice nói `check` chuyển sang quá khứ phân từ.

---

### Stage 5 — FINAL ANSWER

**Mục tiêu:**

- Hiển thị câu bị động hoàn chỉnh.
- Củng cố công thức của thì hiện tại đơn bị động.

**Visual hiển thị:**

> Patients' blood pressure is often checked by doctors.

Kèm theo:

```text
PRESENT SIMPLE PASSIVE
S + am/is/are + V3/-ed + (by O)
```

**Voice segment:** `Q01_04_answer.mp3`

**Voice script:**

> Câu bị động hoàn chỉnh là: Patients' blood pressure is often checked by doctors.

**Yêu cầu đồng bộ:** Final Answer chỉ xuất hiện khi voice bắt đầu nói `Câu bị động hoàn chỉnh là...`.

---

## 6. Mapping Voice → Visual

| Thứ tự | Voice | Visual state | Ghi chú |
|---:|---|---|---|
| 1 | `Q01_01_question.mp3` | QUESTION | Đọc câu chủ động |
| 2 | Không voice | THINK | Dừng 3–5 giây |
| 3 | `Q01_02_svo.mp3` | IDENTIFY S–V–O | Hiện marker S, V, O |
| 4 | `Q01_03_transform.mp3` | TRANSFORM | Move O, chọn `is`, đổi `check → checked` |
| 5 | `Q01_04_answer.mp3` | FINAL ANSWER | Hiện đáp án và công thức |

Mức đồng bộ của prototype là **theo ý**, chưa cần đồng bộ từng từ.

---

## 7. Quy trình dựng video

### Bước 1 — Chuẩn hóa Answer Spec

Xác nhận đầy đủ:

- Active sentence
- S / V / O / Adverb
- Passive subject
- Be
- V3/-ed
- Final answer
- Grammar rule

### Bước 2 — Viết voice script

- Chia thành bốn segment độc lập.
- Mỗi segment chỉ đảm nhiệm một mục tiêu giảng dạy.
- Không tạo một file voice duy nhất cho toàn câu.

### Bước 3 — Tạo voice

- Có thể dùng ElevenLabs nếu ưu tiên chất lượng giọng.
- Có thể dùng CapCut TTS nếu ưu tiên tốc độ.
- Export đúng tên file của từng segment.

### Bước 4 — Chuẩn bị visual

Từ master slide, duplicate hoặc export thành năm visual state:

```text
Q01_01_QUESTION.png
Q01_02_THINK.png
Q01_03_SVO.png
Q01_04_TRANSFORM.png
Q01_05_ANSWER.png
```

Mỗi state chỉ hiển thị các layer cần thiết tại thời điểm tương ứng.

### Bước 5 — Thiết lập CapCut

- Aspect ratio: `16:9`
- Resolution: `1920 × 1080`
- FPS: `30`

Thứ tự dựng:

1. Đặt bốn audio segment lên timeline.
2. Chèn khoảng THINK sau voice câu hỏi.
3. Xác định boundary của từng segment.
4. Đặt visual state tương ứng.
5. Kéo dài hoặc rút ngắn visual theo voice thực tế.
6. Kiểm tra đồng bộ theo ý.
7. Chỉ thêm animation sau khi timing đã ổn.
8. Thêm subtitle và kiểm tra thủ công.
9. Export video.

### Bước 6 — Animation

Ưu tiên:

- Fade
- Slide
- Pop nhẹ
- Underline
- Highlight

Không ưu tiên:

- 3D
- Rotation
- Complex zoom
- Flashy transition

### Bước 7 — Subtitle

- Voice tiếng Việt dùng subtitle tiếng Việt.
- Câu tiếng Anh giữ nguyên English text.
- Kiểm tra thủ công các cụm dễ nhận sai: `patients'`, `blood pressure`, `checked`.

---

## 8. Cấu trúc file đề xuất

```text
Q01/
├── 01_source/
│   └── source.txt
├── 02_spec/
│   └── Q01_answer_spec.md
├── 03_script/
│   └── Q01_voice_script.md
├── 04_audio/
│   ├── Q01_01_question.mp3
│   ├── Q01_02_svo.mp3
│   ├── Q01_03_transform.mp3
│   └── Q01_04_answer.mp3
├── 05_visual/
│   ├── Q01_01_QUESTION.png
│   ├── Q01_02_THINK.png
│   ├── Q01_03_SVO.png
│   ├── Q01_04_TRANSFORM.png
│   └── Q01_05_ANSWER.png
├── 06_capcut/
│   └── project/
├── 07_output/
│   └── Passive_PresentSimple_Q01_v1.mp4
└── 08_review/
    └── Q01_review_notes.md
```

---

## 9. Kiểm tra chất lượng

### 9.1. Nội dung

- `Doctors` được xác định đúng là Subject.
- `check` được xác định đúng là Verb.
- `patients' blood pressure` được xác định đúng là Object.
- Passive Subject là `Patients' blood pressure`.
- Dùng `is` vì chủ ngữ mới là số ít.
- `check` chuyển đúng thành `checked`.
- `often` đứng sau `is` trong câu bị động.
- Final answer không sai chính tả, dấu nháy sở hữu hoặc dấu câu.

### 9.2. Trải nghiệm học sinh

- Học sinh có đủ thời gian đọc câu hỏi.
- Khoảng THINK không quá ngắn hoặc quá dài.
- Marker S/V/O rõ ràng.
- Học sinh nhìn thấy được O chuyển thành Passive Subject.
- Lý do dùng `is` được thể hiện trực quan.
- Biến đổi `check → checked` dễ hiểu.
- Đáp án không xuất hiện quá sớm.
- Voice, subtitle và visual không cạnh tranh sự chú ý.
- Chữ đủ lớn khi xem fullscreen trên điện thoại và máy tính.

---

## 10. Definition of Done

Q01 được coi là hoàn thành khi có đủ:

- Answer Spec đã kiểm tra.
- Bốn voice script segment.
- Bốn voice file.
- Một master slide editable.
- Năm visual state hoặc năm trạng thái layer tương ứng.
- CapCut timeline theo nguyên tắc audio-first.
- Subtitle đã kiểm tra thủ công.
- Animation cơ bản, nhất quán.
- File đầu ra `Passive_PresentSimple_Q01_v1.mp4`.
- Review note ghi điểm tốt, điểm cần sửa và quyết định áp dụng cho Q02–Q10.

---

## 11. Quy tắc tái sử dụng cho Q02–Q10

Với mỗi câu tiếp theo:

1. Duplicate master template.
2. Thay Question, S, V, O, Adverb, Be, V3 và Final Answer.
3. Giữ nguyên layout, font, màu và vị trí các vùng.
4. Tạo lại bốn voice segment.
5. Đặt voice lên CapCut trước.
6. Điều chỉnh duration của visual theo voice.
7. Áp dụng cùng ngôn ngữ animation.
8. QA nội dung và trải nghiệm học sinh.

Chỉ thay đổi master template khi review Q01 cho thấy vấn đề mang tính hệ thống. Mọi thay đổi master phải được ghi lại để bảo đảm Q02–Q10 dùng cùng một phiên bản.
