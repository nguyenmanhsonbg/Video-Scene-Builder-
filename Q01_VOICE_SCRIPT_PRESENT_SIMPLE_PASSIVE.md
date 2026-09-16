# Q01 Voice Script

## Present Simple Passive

## 1. Mục tiêu

Voice script này dùng cho video chữa Câu 1 theo **MASTER QUESTION VIDEO TEMPLATE v1**.

Voice được chia thành 4 segment độc lập. Stage **THINK** không có lời thoại và được chèn thành khoảng nghỉ trên timeline.

Giọng đọc đề xuất:

- Giọng giáo viên thân thiện, rõ ràng, bình tĩnh.
- Tốc độ trung bình, không đọc quá nhanh.
- Phần tiếng Việt đọc tự nhiên.
- Các từ tiếng Anh cần phát âm rõ, không Việt hóa.
- Nghỉ ngắn sau từng ý để học sinh kịp quan sát visual.

---

## 2. Tổng quan timeline

| Thứ tự | Stage | File voice | Thời lượng ước tính |
|---:|---|---|---:|
| 1 | QUESTION | `Q01_01_question.mp3` | 5–7 giây |
| 2 | THINK | Không có voice | 4 giây |
| 3 | IDENTIFY S–V–O | `Q01_02_svo.mp3` | 15–20 giây |
| 4 | TRANSFORM | `Q01_03_transform.mp3` | 22–28 giây |
| 5 | FINAL ANSWER | `Q01_04_answer.mp3` | 9–12 giây |

Tổng thời lượng dự kiến: khoảng **55–70 giây**, tùy tốc độ TTS và khoảng nghỉ thực tế.

---

# 3. Voice script chi tiết

## Segment 1 — QUESTION

**Filename:** `Q01_01_question.mp3`

**Visual state:** QUESTION

### Bản dùng để tạo voice

> Câu một.  
> Doctors often check patients' blood pressure.

### Hướng dẫn đọc

- Nghỉ khoảng `0,5 giây` sau “Câu một”.
- Đọc câu tiếng Anh chậm, rõ từng cụm:
  - `Doctors`
  - `often check`
  - `patients' blood pressure`
- Cuối câu hạ giọng nhẹ.

### Visual sync

- Hiện `QUESTION 1` khi bắt đầu đọc “Câu một”.
- Hiện toàn bộ câu chủ động khi bắt đầu đọc `Doctors`.
- Sau khi voice kết thúc, chuyển sang stage THINK.

---

## Stage 2 — THINK

**Voice:** Không có.

**Thời lượng đề xuất:** `4 giây`.

**Visual text:**

> Try it yourself.  
> Identify S – V – O.

### Timeline đề xuất

- Giây 1: Giữ nguyên câu hỏi.
- Giây 2–4: Hiện prompt `Identify S – V – O`.
- Có thể thêm countdown `3 – 2 – 1`, nhưng không bắt buộc.

---

## Segment 2 — IDENTIFY S–V–O

**Filename:** `Q01_02_svo.mp3`

**Visual state:** IDENTIFY S–V–O

### Bản dùng để tạo voice

> Trước tiên, chúng ta xác định các thành phần của câu.  
> “Doctors” là chủ ngữ, ký hiệu S.  
> “Check” là động từ, ký hiệu V.  
> Và “patients' blood pressure” là tân ngữ, ký hiệu O.  
> “Often” là trạng từ chỉ tần suất.

### Hướng dẫn đọc

- Nghỉ khoảng `0,4–0,6 giây` giữa các câu.
- Nhấn nhẹ vào các từ: `Doctors`, `check`, `patients' blood pressure`, `often`.
- Khi đọc `S`, `V`, `O`, đọc tên chữ cái tiếng Anh rõ ràng.

### Visual sync

| Voice bắt đầu nói | Visual xuất hiện hoặc được highlight |
|---|---|
| “Doctors” | Một gạch dưới và label `S` |
| “Check” | Hai gạch dưới và label `V` |
| “patients' blood pressure” | Rounded outline và label `O` |
| “Often” | Highlight nhẹ, không gắn marker S/V/O |

---

## Segment 3 — TRANSFORM

**Filename:** `Q01_03_transform.mp3`

**Visual state:** TRANSFORM

### Bản dùng để tạo voice

> Bây giờ, chúng ta chuyển câu chủ động sang câu bị động.  
> Bước một, đưa tân ngữ “patients' blood pressure” lên đầu câu, làm chủ ngữ mới.  
> Ta được: “Patients' blood pressure”.  
> Bước hai, cụm “blood pressure” là số ít, vì vậy chúng ta dùng “is”.  
> Bước ba, động từ “check” chuyển sang dạng quá khứ phân từ là “checked”.  
> Ghép các thành phần lại, ta có: “Patients' blood pressure, is, checked”.  
> Trạng từ “often” được đặt sau “is”.  
> Cuối cùng, thêm “by doctors” để chỉ người thực hiện hành động.

### Hướng dẫn đọc

- Nghỉ nhẹ sau các cụm `Bước một`, `Bước hai`, `Bước ba`.
- Nhấn rõ:
  - `patients' blood pressure`
  - `chủ ngữ mới`
  - `số ít`
  - `is`
  - `check`
  - `checked`
  - `often`
  - `by doctors`
- Ở câu ghép thành phần, nghỉ rất ngắn giữa các cụm để hỗ trợ animation từng layer.

### Visual sync

| Voice bắt đầu nói | Visual xuất hiện hoặc được highlight |
|---|---|
| “Bước một” | Hiện STEP 1 — MOVE O |
| “đưa tân ngữ...” | Di chuyển Object sang vị trí Passive Subject |
| “Ta được...” | Hiện `Patients' blood pressure` |
| “Bước hai” | Hiện STEP 2 — CHOOSE BE |
| “là số ít” | Hiện `singular` |
| “dùng is” | Highlight `is` |
| “Bước ba” | Hiện STEP 3 — USE V3 |
| “check” | Highlight `check` |
| “checked” | Chuyển hoặc highlight `checked` |
| “Ghép các thành phần...” | Hiện build line theo từng cụm |
| “often” | Chèn `often` sau `is` |
| “by doctors” | Chèn agent ở cuối câu |

### Build line đầy đủ sau animation

> Patients' blood pressure + is + often + checked + by doctors.

---

## Segment 4 — FINAL ANSWER

**Filename:** `Q01_04_answer.mp3`

**Visual state:** FINAL ANSWER

### Bản dùng để tạo voice

> Câu bị động hoàn chỉnh là:  
> Patients' blood pressure is often checked by doctors.  
> Chúng ta ghi nhớ công thức:  
> Chủ ngữ, cộng am, is hoặc are, cộng động từ ở dạng quá khứ phân từ, và có thể thêm by cộng tân ngữ.

### Hướng dẫn đọc

- Nghỉ khoảng `0,6 giây` sau “Câu bị động hoàn chỉnh là”.
- Đọc câu tiếng Anh chậm và liền mạch.
- Nghỉ khoảng `0,5 giây` trước khi đọc công thức.
- Ở công thức, nhấn vào `am, is hoặc are` và `quá khứ phân từ`.

### Visual sync

- Hiện label `FINAL ANSWER` khi bắt đầu câu “Câu bị động hoàn chỉnh là”.
- Hiện từng layer của câu final theo thứ tự:
  1. `Patients' blood pressure`
  2. `is`
  3. `often`
  4. `checked`
  5. `by doctors.`
- Hiện Grammar Rule Bar khi bắt đầu câu “Chúng ta ghi nhớ công thức”.

---

# 4. Bản clean để copy vào công cụ TTS

## Q01_01_question.mp3

```text
Câu một.
Doctors often check patients' blood pressure.
```

## Q01_02_svo.mp3

```text
Trước tiên, chúng ta xác định các thành phần của câu.
“Doctors” là chủ ngữ, ký hiệu S.
“Check” là động từ, ký hiệu V.
Và “patients' blood pressure” là tân ngữ, ký hiệu O.
“Often” là trạng từ chỉ tần suất.
```

## Q01_03_transform.mp3

```text
Bây giờ, chúng ta chuyển câu chủ động sang câu bị động.
Bước một, đưa tân ngữ “patients' blood pressure” lên đầu câu, làm chủ ngữ mới.
Ta được: “Patients' blood pressure”.
Bước hai, cụm “blood pressure” là số ít, vì vậy chúng ta dùng “is”.
Bước ba, động từ “check” chuyển sang dạng quá khứ phân từ là “checked”.
Ghép các thành phần lại, ta có: “Patients' blood pressure, is, checked”.
Trạng từ “often” được đặt sau “is”.
Cuối cùng, thêm “by doctors” để chỉ người thực hiện hành động.
```

## Q01_04_answer.mp3

```text
Câu bị động hoàn chỉnh là:
Patients' blood pressure is often checked by doctors.
Chúng ta ghi nhớ công thức:
Chủ ngữ, cộng am, is hoặc are, cộng động từ ở dạng quá khứ phân từ, và có thể thêm by cộng tân ngữ.
```

---

# 5. Lưu ý khi tạo TTS

- Tạo riêng từng file, không ghép bốn segment trước khi đưa vào CapCut.
- Nếu TTS đọc sai `patients'`, có thể thử bỏ dấu nháy trong input voice, nhưng phải giữ đúng dấu nháy trên visual và subtitle.
- Nếu TTS tiếng Việt đọc các chữ `S`, `V`, `O` không tự nhiên, thay bằng `ét`, `vi`, `âu` trong bản nhập TTS; visual vẫn giữ `S`, `V`, `O`.
- Nghe lại cách phát âm `blood pressure`, `checked` và `doctors` trước khi chốt.
- Không ép duration theo số giây ước tính. Duration thực của voice là căn cứ để đặt visual.
- Sau khi xuất voice, ghi lại duration thực tế của từng file để xây timeline CapCut.

---

# 6. Tiêu chí hoàn thành voice

- Có đủ 4 file audio đúng tên.
- Không có tạp âm hoặc khoảng im lặng thừa ở đầu file.
- Phát âm đúng câu tiếng Anh và các từ khóa.
- Tốc độ đủ chậm để học sinh lớp 10 theo dõi.
- Có khoảng nghỉ tự nhiên giữa các ý.
- Visual có thể sync theo từng ý mà không cần cắt nhỏ lại voice.
- Final answer được đọc đúng nguyên văn.
