// Auto-generated from questionnaire.md — do not hand-edit.
// Batches 1-2 can be appended by re-running the converter.
// Schema: { id, title, pillar, topic, difficulty, question, options[4], answer (0-3), explanation }
export const MCQ_QUESTIONS = [
  {
    "id": "Q66",
    "title": "Softmax Cross-Entropy Gradient",
    "pillar": "DL Fundamentals",
    "topic": "Softmax CE gradient",
    "difficulty": "Intermediate",
    "question": "For a softmax output `p` and one-hot target `y`, what is the gradient of the cross-entropy loss with respect to the logits `z`?",
    "options": [
      "`y − p`",
      "`p − y`",
      "`p ⊙ (1 − p)`",
      "`−y / p`"
    ],
    "answer": 1,
    "explanation": "- **The Core Concept:** The softmax and cross-entropy derivatives combine into a very simple expression.\r\n- **Why B is right:** `∂L/∂zᵢ = pᵢ − yᵢ`. The gradient is the prediction error, which is why it stays well-behaved even when the model is confidently wrong.\r\n- **Why distractors are wrong:** A has the wrong sign (it would ascend the loss). C is the sigmoid derivative form, which saturates. D is `∂L/∂p`, before the softmax Jacobian is applied.\r\n- **Interview Pro-Tip:** Compute the loss from logits (log-softmax / `logsumexp`) rather than from probabilities, to avoid numerical underflow."
  },
  {
    "id": "Q67",
    "title": "Early Stopping",
    "pillar": "DL Fundamentals",
    "topic": "Early stopping",
    "difficulty": "Intermediate",
    "question": "Training loss keeps decreasing, but validation loss has risen for several epochs after reaching a minimum at epoch 12. What is the correct interpretation and action?",
    "options": [
      "Underfitting; increase the learning rate",
      "The validation set is broken; train longer",
      "Vanishing gradients; switch to sigmoid",
      "Overfitting; restore the epoch-12 checkpoint (early stopping) and/or add regularization, augmentation, or more data"
    ],
    "answer": 3,
    "explanation": "- **The Core Concept:** A widening train/validation gap indicates the model is memorizing training data.\r\n- **Why D is right:** The minimum of validation loss marks the best generalization point; checkpointing on it, plus stronger regularization (dropout, weight decay, augmentation), addresses the cause.\r\n- **Why distractors are wrong:** A misdiagnoses; underfit models show high training loss. B is an unfounded assumption. C makes vanishing gradients worse.\r\n- **Interview Pro-Tip:** Use a patience window, and note that with \"double descent\" or grokking-style behavior, very long training can sometimes help; verify on your task."
  },
  {
    "id": "Q68",
    "title": "Gradient Clipping Variants",
    "pillar": "DL Fundamentals",
    "topic": "Clipping variants",
    "difficulty": "Advanced",
    "question": "What is the key difference between clip-by-global-norm and clip-by-value?",
    "options": [
      "Clip-by-global-norm rescales the entire gradient vector when its norm exceeds a threshold, preserving direction; clip-by-value clamps each element independently, which can change the direction",
      "Clip-by-value preserves direction while clip-by-norm does not",
      "They are mathematically identical",
      "Clip-by-norm only works with SGD"
    ],
    "answer": 0,
    "explanation": "- **The Core Concept:** Clipping bounds update size; how it is done affects the direction of the step.\r\n- **Why A is right:** Global-norm clipping computes `g ← g · min(1, c/‖g‖)`, a uniform scaling. Element-wise clamping distorts the relative magnitudes across parameters.\r\n- **Why distractors are wrong:** B reverses it. C is false. D is false; it works with any optimizer.\r\n- **Interview Pro-Tip:** Log the pre-clip gradient norm; frequently hitting the clip threshold signals an LR or data problem rather than a healthy training run."
  },
  {
    "id": "Q69",
    "title": "Exploding Gradients in RNNs",
    "pillar": "DL Fundamentals",
    "topic": "RNN exploding gradients",
    "difficulty": "Advanced",
    "question": "A vanilla RNN's gradients explode on long sequences. What is the underlying cause and the standard remedy?",
    "options": [
      "Too much dropout; remove dropout",
      "A too-small batch size; increase it",
      "Backprop-through-time repeatedly multiplies by the recurrent weight Jacobian; if its spectral radius exceeds 1 the gradient grows exponentially, so clip the gradient norm",
      "The softmax output saturates; replace it with sigmoid"
    ],
    "answer": 2,
    "explanation": "- **The Core Concept:** Gradients through `T` time steps involve a product of `T` Jacobians.\r\n- **Why C is right:** If the largest singular value of `W_hh·diag(σ')` exceeds 1, the product grows as `~λᵀ`; clipping the gradient norm (Pascanu et al., 2013) prevents catastrophic steps.\r\n- **Why distractors are wrong:** A, B, and D do not address the multiplicative recurrence.\r\n- **Interview Pro-Tip:** Clipping fixes *exploding* gradients; *vanishing* gradients need gated architectures (LSTM/GRU), attention, or residual paths."
  },
  {
    "id": "Q70",
    "title": "Parameter Counting",
    "pillar": "DL Fundamentals",
    "topic": "Parameter counting",
    "difficulty": "Advanced",
    "question": "How many parameters (weights + biases) does an MLP with layer sizes 784 → 512 → 256 → 10 have?",
    "options": [
      "535,040",
      "535,818",
      "1,071,636",
      "267,909"
    ],
    "answer": 1,
    "explanation": "- **The Core Concept:** A dense layer has `in × out` weights plus `out` biases.\r\n- **Why B is right:** `784·512 + 512 = 401,920`; `512·256 + 256 = 131,328`; `256·10 + 10 = 2,570`. Total = `535,818`.\r\n- **Why distractors are wrong:** A omits biases (535,040 is weights only). C doubles the count. D halves it.\r\n- **Interview Pro-Tip:** Memory at training ≈ `params × (weights + grads + optimizer states)`; for Adam in FP32 that is 16 B/param."
  },
  {
    "id": "Q71",
    "title": "BatchNorm Folding",
    "pillar": "DL Fundamentals",
    "topic": "BatchNorm folding",
    "difficulty": "Expert",
    "question": "When deploying a conv + BatchNorm block for inference, why can the BN be folded into the convolution?",
    "options": [
      "BN is always the identity at inference",
      "BN has no learnable parameters",
      "The batch statistics are recomputed on each request and absorbed into the bias",
      "At inference BN uses fixed running mean and variance, making it a per-channel affine transform that can be merged: `w' = w·γ/√(σ²+ε)`, `b' = β + (b − μ)·γ/√(σ²+ε)`"
    ],
    "answer": 3,
    "explanation": "- **The Core Concept:** Composition of two affine operations is affine.\r\n- **Why D is right:** With frozen statistics, BN is `y = γ(x − μ)/√(σ²+ε) + β`, a per-channel scale and shift that can be merged into the preceding conv's weights and bias, removing the layer at zero accuracy cost.\r\n- **Why distractors are wrong:** A is false. B is false (γ, β are learned). C describes training-mode behavior.\r\n- **Interview Pro-Tip:** Folding is a standard graph optimization in TensorRT, ONNX Runtime, and TFLite; it does not apply in training, where batch statistics change each step."
  },
  {
    "id": "Q72",
    "title": "Adam Bias Correction",
    "pillar": "DL Fundamentals",
    "topic": "Adam bias correction",
    "difficulty": "Expert",
    "question": "Adam initializes `m₀ = v₀ = 0` with `β₁ = 0.9`, `β₂ = 0.999`. If the bias correction were omitted, how would the very first update `m₁/√v₁` compare to the corrected one?",
    "options": [
      "About 3.2× too large",
      "About 10× too small",
      "About 31.6× too large",
      "Unchanged"
    ],
    "answer": 0,
    "explanation": "- **The Core Concept:** Zero-initialized moving averages are biased toward zero early on, and the two moments are biased by different amounts.\r\n- **Why A is right:** At `t = 1`: `m₁ = 0.1g`, `v₁ = 0.001g²`, so `m₁/√v₁ = 0.1/0.0316 ≈ 3.16` versus 1 after correction (`m̂ = g`, `v̂ = g²`). Early steps would be ≈ 3× too large.\r\n- **Why distractors are wrong:** B and C use the wrong ratios (C is `1/√0.001` on its own). D ignores the different bias factors.\r\n- **Interview Pro-Tip:** The mismatch fades as `1 − βᵗ → 1`, which is why it only matters for early steps, especially with large `β₂`."
  },
  {
    "id": "Q73",
    "title": "Encoder vs. Decoder Architectures",
    "pillar": "Transformers/LLMs",
    "topic": "Encoder vs. decoder",
    "difficulty": "Intermediate",
    "question": "Which description of BERT-style vs. GPT-style models is correct?",
    "options": [
      "Both are trained with a causal mask",
      "BERT is autoregressive, GPT is bidirectional",
      "BERT is a bidirectional encoder trained with masked-language modeling, well suited to understanding tasks; GPT is a causal decoder trained on next-token prediction, suited to generation",
      "BERT cannot be fine-tuned"
    ],
    "answer": 2,
    "explanation": "- **The Core Concept:** The attention mask and training objective determine what the model can do.\r\n- **Why C is right:** BERT sees context on both sides and predicts masked tokens; GPT sees only the left context and predicts the next token, so it generates text naturally.\r\n- **Why distractors are wrong:** A and B swap or merge the properties; D is false.\r\n- **Interview Pro-Tip:** Encoder-decoder models (T5) combine both; today, decoder-only models dominate through scale and instruction tuning, while encoders still win on cheap embedding and classification workloads."
  },
  {
    "id": "Q74",
    "title": "Perplexity",
    "pillar": "Transformers/LLMs",
    "topic": "Perplexity",
    "difficulty": "Intermediate",
    "question": "A language model has an average cross-entropy of 2.0 nats per token on a test set. What is its perplexity?",
    "options": [
      "2.0",
      "≈ 7.4",
      "4.0",
      "≈ 0.135"
    ],
    "answer": 1,
    "explanation": "- **The Core Concept:** Perplexity = `exp(average negative log-likelihood)`.\r\n- **Why B is right:** `e² ≈ 7.39`: the model is as uncertain as a uniform choice among ~7.4 tokens.\r\n- **Why distractors are wrong:** A is the loss itself. C would be `2²` (the formula for bits, not nats). D is `e⁻²`.\r\n- **Interview Pro-Tip:** Perplexity is only comparable across models sharing a tokenizer; use bits-per-byte to compare across vocabularies."
  },
  {
    "id": "Q75",
    "title": "DPO vs. RLHF",
    "pillar": "Transformers/LLMs",
    "topic": "DPO vs. RLHF",
    "difficulty": "Advanced",
    "question": "How does Direct Preference Optimization (DPO) differ from classic RLHF with PPO?",
    "options": [
      "DPO optimizes the policy directly on preference pairs with a classification-style loss derived from the KL-constrained reward objective, with no separate reward model or RL sampling loop",
      "DPO needs a bigger reward model than PPO",
      "DPO does not use a reference model",
      "DPO uses no preference data"
    ],
    "answer": 0,
    "explanation": "- **The Core Concept:** Under the KL-regularized RLHF objective, the optimal policy implies a reward expressed through policy/reference log-ratios.\r\n- **Why A is right:** Substituting this implicit reward into the Bradley–Terry preference model gives a simple loss on `(chosen, rejected)` pairs, which is much simpler and more stable than PPO's multi-model pipeline.\r\n- **Why distractors are wrong:** B and D are false. C is false; the loss uses log-ratios against a frozen reference policy.\r\n- **Interview Pro-Tip:** DPO is offline (fixed data) and can over-optimize or favor longer outputs; online methods (PPO, GRPO) can win when you have a verifiable reward."
  },
  {
    "id": "Q76",
    "title": "Transformer Parameter Estimate",
    "pillar": "Transformers/LLMs",
    "topic": "Parameter estimate",
    "difficulty": "Advanced",
    "question": "Using `≈ 12·L·d²` parameters for the transformer blocks, roughly how many parameters does a model with `L = 96` layers and `d = 12,288` have (excluding embeddings)?",
    "options": [
      "≈ 1.7B",
      "≈ 17B",
      "≈ 1.7T",
      "≈ 174B"
    ],
    "answer": 3,
    "explanation": "- **The Core Concept:** Each block has ≈ `4d²` attention parameters (Q, K, V, O) and ≈ `8d²` MLP parameters (with 4× expansion).\r\n- **Why D is right:** `12 × 96 × 12,288² = 12 × 96 × 150,994,944 ≈ 1.74 × 10¹¹`, matching the ~175B scale of GPT-3.\r\n- **Why distractors are wrong:** A, B, and C are off by 10× or 100× from the formula.\r\n- **Interview Pro-Tip:** Embeddings add `V·d`; SwiGLU MLPs and GQA change the constants slightly, but `12Ld²` is a good back-of-envelope estimator."
  },
  {
    "id": "Q77",
    "title": "Prefill vs. Decode",
    "pillar": "Transformers/LLMs",
    "topic": "Prefill vs. decode",
    "difficulty": "Advanced",
    "question": "Which statement about the two phases of LLM inference is correct?",
    "options": [
      "Both phases are memory-bandwidth-bound",
      "Prefill is memory-bound and decode is compute-bound",
      "Prefill processes all prompt tokens in parallel and is usually compute-bound, while decode generates one token per step and is usually memory-bandwidth-bound",
      "Prefill is sequential, and decode is parallel"
    ],
    "answer": 2,
    "explanation": "- **The Core Concept:** Arithmetic intensity (FLOPs per byte moved) differs sharply between phases.\r\n- **Why C is right:** Prefill does large matmuls over many tokens, so the weights are reused heavily; decode reuses each loaded weight for just one token per sequence (per batch row).\r\n- **Why distractors are wrong:** A, B, and D misstate the parallelism or the bottleneck.\r\n- **Interview Pro-Tip:** This is why time-to-first-token (prefill) and inter-token latency (decode) are tracked separately, and why chunked prefill and disaggregated prefill/decode serving exist."
  },
  {
    "id": "Q78",
    "title": "Decode Throughput Bound",
    "pillar": "Transformers/LLMs",
    "topic": "Decode throughput bound",
    "difficulty": "Advanced",
    "question": "A 7B-parameter model in FP16 (~14 GB) runs at batch size 1 on a GPU with ~2 TB/s memory bandwidth. What is the approximate upper bound on decode speed?",
    "options": [
      "≈ 14 tokens/s",
      "≈ 140 tokens/s",
      "≈ 1,400 tokens/s",
      "≈ 14,000 tokens/s"
    ],
    "answer": 1,
    "explanation": "- **The Core Concept:** At batch 1, each generated token requires reading all weights once.\r\n- **Why B is right:** `14 GB / 2,000 GB/s = 7 ms/token ≈ 143 tokens/s` as a ceiling (KV-cache reads and overheads reduce it).\r\n- **Why distractors are wrong:** A and C are off by 10×; D would exceed any bandwidth limit.\r\n- **Interview Pro-Tip:** Raise throughput with quantization (fewer bytes), batching (amortize loads), or speculative decoding (more tokens per weight read)."
  },
  {
    "id": "Q79",
    "title": "Training Compute Estimation",
    "pillar": "Transformers/LLMs",
    "topic": "Training compute",
    "difficulty": "Expert",
    "question": "Using `C ≈ 6·N·D` FLOPs, estimate the GPU-hours to train a 7B-parameter model on 2T tokens on A100s (312 TFLOPs peak BF16) at 40% model-FLOPs utilization.",
    "options": [
      "≈ 1.9k GPU-hours",
      "≈ 19k GPU-hours",
      "≈ 1.9M GPU-hours",
      "≈ 190k GPU-hours"
    ],
    "answer": 3,
    "explanation": "- **The Core Concept:** Training costs ≈ 6 FLOPs per parameter per token (2 forward, 4 backward).\r\n- **Why D is right:** `6 × 7×10⁹ × 2×10¹² = 8.4×10²² FLOPs`. Effective throughput = `0.4 × 312×10¹² ≈ 1.25×10¹⁴ FLOP/s`. Time = `6.7×10⁸` GPU-seconds ≈ `1.87×10⁵` GPU-hours.\r\n- **Why distractors are wrong:** A, B, and C differ by factors of 10 or more from the calculation.\r\n- **Interview Pro-Tip:** Realistic MFU for large-scale runs is ~35–55%; activation recomputation adds ~33% more FLOPs that are not counted as \"useful\" in MFU."
  },
  {
    "id": "Q80",
    "title": "Precision and Recall",
    "pillar": "CV/Multimodal",
    "topic": "Precision/recall",
    "difficulty": "Intermediate",
    "question": "A detector yields TP = 80, FP = 20, FN = 40. What are its precision and recall?",
    "options": [
      "Precision 0.80, recall ≈ 0.67",
      "Precision ≈ 0.67, recall 0.80",
      "Precision 0.80, recall 0.80",
      "Precision 0.50, recall 0.50"
    ],
    "answer": 0,
    "explanation": "- **The Core Concept:** Precision = `TP/(TP+FP)`, recall = `TP/(TP+FN)`.\r\n- **Why A is right:** `80/100 = 0.80`; `80/120 ≈ 0.667`.\r\n- **Why distractors are wrong:** B swaps the metrics; C and D are not supported by the counts.\r\n- **Interview Pro-Tip:** Precision answers \"of what I flagged, how much is right?\"; recall answers \"of what exists, how much did I find?\""
  },
  {
    "id": "Q81",
    "title": "Convolution Output Size",
    "pillar": "CV/Multimodal",
    "topic": "Conv output size",
    "difficulty": "Intermediate",
    "question": "An input of 224×224 passes through a convolution with kernel 7, stride 2, padding 3. What is the output spatial size?",
    "options": [
      "109",
      "111",
      "112",
      "115"
    ],
    "answer": 2,
    "explanation": "- **The Core Concept:** `out = ⌊(in + 2p − k)/s⌋ + 1`.\r\n- **Why C is right:** `⌊(224 + 6 − 7)/2⌋ + 1 = ⌊111.5⌋ + 1 = 112`. This is ResNet's stem.\r\n- **Why distractors are wrong:** They result from dropping the padding, the floor, or the `+1`.\r\n- **Interview Pro-Tip:** Know this formula cold; it also appears in dilated (`k_eff = d(k−1)+1`) and transposed-convolution variants."
  },
  {
    "id": "Q82",
    "title": "Focal Loss",
    "pillar": "CV/Multimodal",
    "topic": "Focal loss",
    "difficulty": "Advanced",
    "question": "In focal loss `FL = −(1 − p_t)^γ · log(p_t)` with `γ = 2`, how much is a well-classified example (`p_t = 0.9`) down-weighted relative to standard cross-entropy?",
    "options": [
      "By a factor of 0.01",
      "By a factor of 0.1",
      "It is not down-weighted",
      "By a factor of 0.81"
    ],
    "answer": 0,
    "explanation": "- **The Core Concept:** Focal loss reduces the contribution of easy examples so training focuses on hard ones (e.g., rare foreground objects in dense detectors).\r\n- **Why A is right:** `(1 − 0.9)² = 0.01`, a 100× reduction, while a hard example with `p_t = 0.1` keeps a factor of `0.81`.\r\n- **Why distractors are wrong:** B uses `γ = 1`. C ignores the modulating factor. D is the factor for the *hard* example.\r\n- **Interview Pro-Tip:** Focal loss was introduced in RetinaNet to address the extreme foreground/background imbalance of one-stage detectors."
  },
  {
    "id": "Q83",
    "title": "DETR and Set Prediction",
    "pillar": "CV/Multimodal",
    "topic": "DETR set prediction",
    "difficulty": "Advanced",
    "question": "How does DETR avoid the need for non-maximum suppression?",
    "options": [
      "It uses larger anchors",
      "It predicts a fixed-size set of objects and trains with Hungarian (bipartite) matching, enforcing a one-to-one assignment between predictions and ground-truth boxes",
      "It uses the IoU threshold during inference only",
      "It averages overlapping boxes"
    ],
    "answer": 1,
    "explanation": "- **The Core Concept:** Duplicates arise from one-to-many label assignment; one-to-one assignment removes them by design.\r\n- **Why B is right:** Hungarian matching assigns each ground-truth object to exactly one query; unmatched queries are trained to predict \"no object,\" so duplicates get penalized.\r\n- **Why distractors are wrong:** A is anchor-based and not DETR. C and D describe post-processing, not the training design.\r\n- **Interview Pro-Tip:** DETR trains slowly; Deformable DETR, DN-DETR, and one-to-many auxiliary training speed up convergence."
  },
  {
    "id": "Q84",
    "title": "Masked Autoencoders",
    "pillar": "CV/Multimodal",
    "topic": "MAE efficiency",
    "difficulty": "Advanced",
    "question": "Why is Masked Autoencoder (MAE) pretraining efficient for ViTs when ~75% of patches are masked?",
    "options": [
      "The model skips the decoder entirely",
      "Only 25% of the images are used",
      "It uses CNNs for the encoder",
      "The encoder processes only the visible 25% of patches; a lightweight decoder reconstructs the masked ones, cutting encoder compute substantially"
    ],
    "answer": 3,
    "explanation": "- **The Core Concept:** Unlike BERT, MAE does not feed mask tokens into the encoder.\r\n- **Why D is right:** With 25% of tokens, encoder attention cost falls by roughly 16× (quadratic) and the MLP cost by ~4×; the small decoder handles mask tokens. The high masking ratio makes the task hard enough to learn useful features.\r\n- **Why distractors are wrong:** A is false; the decoder is used for pretraining. B is false; all images are used. C is false.\r\n- **Interview Pro-Tip:** The decoder is discarded after pretraining; only the encoder is used for downstream tasks."
  },
  {
    "id": "Q85",
    "title": "Receptive Field Calculation",
    "pillar": "CV/Multimodal",
    "topic": "Receptive field",
    "difficulty": "Expert",
    "question": "A network applies: conv3×3 (stride 1) → conv3×3 (stride 1) → maxpool 2×2 (stride 2) → conv3×3 (stride 1). What is the receptive field of a final unit?",
    "options": [
      "7",
      "9",
      "10",
      "12"
    ],
    "answer": 2,
    "explanation": "- **The Core Concept:** Track receptive field `r` and jump `j` (cumulative stride): `r ← r + (k − 1)·j`, `j ← j·s`.\r\n- **Why C is right:** Start `r = 1, j = 1`. conv3: `r = 3`. conv3: `r = 5`. pool k=2, s=2: `r = 5 + 1·1 = 6`, `j = 2`. conv3: `r = 6 + 2·2 = 10`.\r\n- **Why distractors are wrong:** A and B ignore the jump after the pool; D double counts.\r\n- **Interview Pro-Tip:** The effective receptive field is much smaller than the theoretical one (roughly Gaussian-weighted), which motivates dilations, attention, and large-kernel convolutions."
  },
  {
    "id": "Q86",
    "title": "Diffusion Forward Process",
    "pillar": "CV/Multimodal",
    "topic": "Diffusion forward process",
    "difficulty": "Expert",
    "question": "In a DDPM forward process, `x_t = √ᾱ_t·x₀ + √(1 − ᾱ_t)·ε`. If `ᾱ_t = 0.64` at some step, what are the signal scale and noise scale?",
    "options": [
      "Signal 0.64, noise 0.36",
      "Signal 0.80, noise 0.60",
      "Signal 0.36, noise 0.64",
      "Signal 0.80, noise 0.36"
    ],
    "answer": 1,
    "explanation": "- **The Core Concept:** Because the per-step noise is Gaussian, the marginal at any step has a closed form, so training can sample any `t` directly.\r\n- **Why B is right:** `√0.64 = 0.8` and `√(1 − 0.64) = √0.36 = 0.6`; notice the variance is preserved (`0.8² + 0.6² = 1`).\r\n- **Why distractors are wrong:** A, C, and D forget the square roots or mix the terms.\r\n- **Interview Pro-Tip:** SNR at step `t` is `ᾱ_t/(1 − ᾱ_t)`; here ≈ 1.78. Noise schedules (linear, cosine) are essentially choices of how SNR decays."
  },
  {
    "id": "Q87",
    "title": "Batch vs. Online Inference",
    "pillar": "MLOps/Systems",
    "topic": "Batch vs. online inference",
    "difficulty": "Intermediate",
    "question": "You must show product recommendations for 10M users, refreshed daily, where per-request context does not change the results. Which inference design is the best fit?",
    "options": [
      "Batch inference, precomputing recommendations and serving them from a low-latency key-value store",
      "Online inference with a GPU per request",
      "Edge inference on user devices only",
      "Re-train the model on every request"
    ],
    "answer": 0,
    "explanation": "- **The Core Concept:** Choose the inference mode by freshness and latency requirements.\r\n- **Why A is right:** When inputs change slowly, precomputing is cheaper, simpler, and gives predictable latency; the online path becomes a lookup.\r\n- **Why distractors are wrong:** B is expensive and unnecessary. C is not required here. D is absurd.\r\n- **Interview Pro-Tip:** A common hybrid is batch candidate generation plus a lightweight online re-ranker for fresh context."
  },
  {
    "id": "Q88",
    "title": "Sample Ratio Mismatch",
    "pillar": "MLOps/Systems",
    "topic": "Sample ratio mismatch",
    "difficulty": "Intermediate",
    "question": "An A/B test intended 50/50 allocation shows 508,000 vs. 492,000 users (1M total). What does this indicate?",
    "options": [
      "Normal randomness, nothing to worry about",
      "The treatment is better",
      "The experiment needs more users",
      "A sample ratio mismatch (χ² ≈ 256, p ≈ 0), which suggests an assignment or logging bug, so the results should not be trusted until it is explained"
    ],
    "answer": 3,
    "explanation": "- **The Core Concept:** Randomization must produce the designed split; deviations signal a flawed experiment.\r\n- **Why D is right:** Expected 500,000 each; `χ² = 2 × 8,000²/500,000 = 256` with 1 df, an astronomically small p-value. Typical causes: bot filtering, redirects, or logging dropout differing by arm.\r\n- **Why distractors are wrong:** A is wrong given the statistics. B and C do not explain a skewed assignment.\r\n- **Interview Pro-Tip:** Run an SRM check automatically on every experiment, before looking at metrics."
  },
  {
    "id": "Q89",
    "title": "INT8 Quantization Arithmetic",
    "pillar": "MLOps/Systems",
    "topic": "INT8 quantization",
    "difficulty": "Advanced",
    "question": "A tensor is quantized to INT8 with symmetric per-tensor quantization. Its maximum absolute value is 6.35, so the scale is `6.35/127 = 0.05`. What integer represents the value 2.0?",
    "options": [
      "20",
      "32",
      "40",
      "127"
    ],
    "answer": 2,
    "explanation": "- **The Core Concept:** `q = round(x / scale)`, clamped to `[−127, 127]`.\r\n- **Why C is right:** `2.0 / 0.05 = 40`.\r\n- **Why distractors are wrong:** A and B come from wrong scales. D is the code for the maximum value 6.35.\r\n- **Interview Pro-Tip:** Per-channel scales for weights and calibration for activations reduce error; outlier channels in LLM activations are why techniques like SmoothQuant and AWQ exist."
  },
  {
    "id": "Q90",
    "title": "Distillation Temperature",
    "pillar": "MLOps/Systems",
    "topic": "Distillation temperature",
    "difficulty": "Advanced",
    "question": "In knowledge distillation with temperature `T`, why is the soft-target loss multiplied by `T²`?",
    "options": [
      "The gradients of the soft-target term scale as `1/T²`, so multiplying by `T²` keeps its contribution comparable to the hard-label loss",
      "To make the loss non-negative",
      "To increase the number of classes",
      "It is only a convention with no effect"
    ],
    "answer": 0,
    "explanation": "- **The Core Concept:** Raising `T` softens both teacher and student distributions and shrinks the gradient magnitudes.\r\n- **Why A is right:** Hinton et al. showed the soft-target gradients scale roughly with `1/T²`; rescaling preserves relative weighting when `T` changes.\r\n- **Why distractors are wrong:** B is false. C is irrelevant. D is false; omitting it changes the effective loss weighting.\r\n- **Interview Pro-Tip:** Typical `T` is 2–5; the student is evaluated at `T = 1`."
  },
  {
    "id": "Q91",
    "title": "Position Bias in Ranking",
    "pillar": "MLOps/Systems",
    "topic": "Position bias",
    "difficulty": "Advanced",
    "question": "A new ranker is trained on click logs collected under the previous ranker. Items shown at the top get many clicks regardless of their true relevance. What is the issue and a standard remedy?",
    "options": [
      "Concept drift; retrain daily",
      "Position (exposure) bias; use inverse-propensity weighting, position as a feature removed at serving, or randomized exploration",
      "Class imbalance; oversample negatives",
      "Overfitting; add dropout"
    ],
    "answer": 1,
    "explanation": "- **The Core Concept:** Observed clicks are a product of relevance *and* examination probability.\r\n- **Why B is right:** Without correction, the new model learns to reproduce the old ranking (a feedback loop). IPS reweights clicks by `1/P(examined | position)`; randomized swaps estimate those propensities.\r\n- **Why distractors are wrong:** A, C, and D do not address the causal bias in logged data.\r\n- **Interview Pro-Tip:** Keep a small exploration traffic slice to get unbiased data for evaluation and training."
  },
  {
    "id": "Q92",
    "title": "Population Stability Index",
    "pillar": "MLOps/Systems",
    "topic": "PSI",
    "difficulty": "Advanced",
    "question": "A feature's PSI between training and serving data is 0.31. How should this be interpreted under the usual rule of thumb?",
    "options": [
      "Stable (< 0.1)",
      "Slight drift; ignore",
      "Cannot be interpreted without labels",
      "Significant shift (> 0.25); investigate the data pipeline and consider retraining"
    ],
    "answer": 3,
    "explanation": "- **The Core Concept:** PSI = `Σ (pᵢ − qᵢ)·ln(pᵢ/qᵢ)` over bins, a symmetric divergence between two distributions.\r\n- **Why D is right:** Common thresholds: < 0.1 stable, 0.1–0.25 moderate, > 0.25 significant.\r\n- **Why distractors are wrong:** A and B contradict the thresholds. C is false; PSI is label-free.\r\n- **Interview Pro-Tip:** PSI depends on binning and sample size; combine it with feature-importance weighting so you prioritize shifts in features the model actually uses."
  },
  {
    "id": "Q93",
    "title": "All-Reduce Communication Volume",
    "pillar": "MLOps/Systems",
    "topic": "All-reduce volume",
    "difficulty": "Expert",
    "question": "In data-parallel training with ring all-reduce across `N = 8` GPUs, the gradients are 14 GB (7B params in FP16). Approximately how much data does each GPU send per step?",
    "options": [
      "14 GB",
      "12.25 GB",
      "24.5 GB",
      "112 GB"
    ],
    "answer": 2,
    "explanation": "- **The Core Concept:** Ring all-reduce = reduce-scatter + all-gather; each phase sends `(N−1)/N` of the data per GPU.\r\n- **Why C is right:** `2 × (7/8) × 14 GB = 24.5 GB`, nearly independent of `N`, which is why ring all-reduce scales well in bandwidth.\r\n- **Why distractors are wrong:** A ignores the 2 phases. B is only one phase. D is `N × 14 GB`, what naive all-to-all would cost.\r\n- **Interview Pro-Tip:** Overlap communication with the backward pass (bucketed gradients) and use gradient compression or larger intervals only when interconnect-bound."
  },
  {
    "id": "Q94",
    "title": "Geometric Distribution",
    "pillar": "Math/Stats",
    "topic": "Geometric distribution",
    "difficulty": "Intermediate",
    "question": "How many rolls of a fair six-sided die are needed, on average, to get the first six?",
    "options": [
      "6",
      "3.5",
      "12",
      "36"
    ],
    "answer": 0,
    "explanation": "- **The Core Concept:** The waiting time until the first success in independent Bernoulli trials is geometric with mean `1/p`.\r\n- **Why A is right:** `p = 1/6`, so `E = 6`.\r\n- **Why distractors are wrong:** B is the mean of a single roll. C and D have no basis in the formula.\r\n- **Interview Pro-Tip:** The variance is `(1 − p)/p²` = 30; geometric waiting times have heavy variability, which is relevant when estimating retry counts or time-to-event."
  },
  {
    "id": "Q95",
    "title": "Correlation vs. Covariance",
    "pillar": "Math/Stats",
    "topic": "Correlation vs. covariance",
    "difficulty": "Intermediate",
    "question": "You change the units of variable `X` from meters to centimeters. What happens to its covariance and Pearson correlation with `Y`?",
    "options": [
      "Both are unchanged",
      "Covariance is scaled by 100; the correlation is unchanged",
      "Correlation is scaled by 100; covariance is unchanged",
      "Both are scaled by 100"
    ],
    "answer": 1,
    "explanation": "- **The Core Concept:** Correlation is the covariance normalized by both standard deviations.\r\n- **Why B is right:** `Cov(100X, Y) = 100·Cov(X, Y)`, while `ρ = Cov/(σₓσᵧ)` divides out the factor of 100.\r\n- **Why distractors are wrong:** A, C, and D misassign the scaling behavior.\r\n- **Interview Pro-Tip:** This is why correlation, not covariance, is used to compare relationships across variables with different units; the same logic motivates standardizing before PCA."
  },
  {
    "id": "Q96",
    "title": "L1 vs. L2 Sparsity",
    "pillar": "Math/Stats",
    "topic": "L1 vs. L2 sparsity",
    "difficulty": "Advanced",
    "question": "Why does L1 regularization drive weights exactly to zero while L2 only shrinks them?",
    "options": [
      "L2 has a larger gradient near zero",
      "L1 is smoother than L2",
      "L1 only works on convex losses",
      "The L1 penalty has a constant-magnitude (sub)gradient `λ·sign(w)` that keeps pushing small weights to zero, while the L2 gradient `2λw` vanishes as `w → 0`"
    ],
    "answer": 3,
    "explanation": "- **The Core Concept:** The shape of the penalty at zero determines whether solutions land on the axes.\r\n- **Why D is right:** The L1 \"diamond\" has corners on the axes, and its constant pull dominates when the data gradient is smaller than `λ` (soft-thresholding). L2's pull shrinks proportionally to `w` and never reaches exactly zero.\r\n- **Why distractors are wrong:** A is reversed. B is false; L1 is non-differentiable at 0. C is false.\r\n- **Interview Pro-Tip:** Elastic net combines both, handling correlated features better than pure L1 (which tends to pick one at random)."
  },
  {
    "id": "Q97",
    "title": "Confidence Interval Interpretation",
    "pillar": "Math/Stats",
    "topic": "Confidence intervals",
    "difficulty": "Advanced",
    "question": "What does a 95% confidence interval mean in frequentist statistics?",
    "options": [
      "There is a 95% probability that the true parameter lies in this specific computed interval",
      "95% of the data points fall within the interval",
      "If the experiment were repeated many times, about 95% of the intervals constructed this way would contain the true parameter",
      "The estimate is 95% accurate"
    ],
    "answer": 2,
    "explanation": "- **The Core Concept:** The randomness is in the interval, not in the fixed (unknown) parameter.\r\n- **Why C is right:** The coverage guarantee refers to the long-run procedure.\r\n- **Why distractors are wrong:** A is the Bayesian credible-interval interpretation. B confuses a CI with a prediction/tolerance interval. D is meaningless.\r\n- **Interview Pro-Tip:** In interviews, state the repeated-sampling definition clearly, then mention that a Bayesian credible interval answers the \"probability the parameter is in here\" question."
  },
  {
    "id": "Q98",
    "title": "Gradient Descent on a Quadratic",
    "pillar": "Math/Stats",
    "topic": "GD on quadratics",
    "difficulty": "Advanced",
    "question": "For a quadratic loss with Hessian eigenvalues `μ = 1` and `L = 100`, gradient descent uses the optimal fixed step size `2/(L+μ)`. What is the per-step contraction factor of the error?",
    "options": [
      "≈ 0.98",
      "0.5",
      "0.01",
      "0.9"
    ],
    "answer": 0,
    "explanation": "- **The Core Concept:** Convergence speed depends on the condition number `κ = L/μ`.\r\n- **Why A is right:** The contraction factor is `(κ − 1)/(κ + 1) = 99/101 ≈ 0.980`, so reducing the error by 10× takes ~114 steps.\r\n- **Why distractors are wrong:** B, C, and D would imply a far better-conditioned problem.\r\n- **Interview Pro-Tip:** Preconditioning (Adam, Newton, natural gradient) and normalization layers essentially try to reduce `κ`; momentum improves the rate toward `(√κ − 1)/(√κ + 1)`."
  },
  {
    "id": "Q99",
    "title": "Least-Squares Gradient",
    "pillar": "Math/Stats",
    "topic": "Least-squares gradient",
    "difficulty": "Advanced",
    "question": "For the loss `J(w) = (1/2n)‖Xw − y‖²`, what is `∇_w J`?",
    "options": [
      "`(1/n) X (Xw − y)ᵀ`",
      "`(1/n) Xᵀ(Xw − y)`",
      "`(1/n) (Xw − y)ᵀ X w`",
      "`(1/2n) Xᵀ(Xw − y)`"
    ],
    "answer": 1,
    "explanation": "- **The Core Concept:** Differentiating a squared norm: `∇_w ½‖r‖² = Jᵣᵀ r`, where `r = Xw − y` and the Jacobian of `r` is `X`.\r\n- **Why B is right:** The ½ cancels the factor 2 from the square, leaving `(1/n) Xᵀ(Xw − y)`. Setting it to zero gives the normal equations `XᵀXw = Xᵀy`.\r\n- **Why distractors are wrong:** A has mismatched shapes. C is not a gradient (scalar times `w`). D leaves a stray factor of ½.\r\n- **Interview Pro-Tip:** Always sanity-check dimensions: `w ∈ ℝᵈ` means the gradient must be `d`-dimensional."
  },
  {
    "id": "Q100",
    "title": "Reparameterization Trick",
    "pillar": "Math/Stats",
    "topic": "Reparameterization trick",
    "difficulty": "Expert",
    "question": "In a VAE, why is the reparameterization trick `z = μ + σ ⊙ ε` with `ε ~ N(0, I)` used?",
    "options": [
      "It makes the latent space discrete",
      "It removes the need for a KL term",
      "It increases the latent dimensionality",
      "It moves the randomness into a parameter-free noise variable, so `z` is a deterministic differentiable function of `(μ, σ)` and gradients can flow through sampling with lower variance than score-function (REINFORCE) estimators"
    ],
    "answer": 3,
    "explanation": "- **The Core Concept:** Backpropagation cannot pass through a random sampling node unless the randomness is made external.\r\n- **Why D is right:** Writing the sample as a function of `(μ, σ)` and independent noise allows pathwise gradients `∂z/∂μ = 1`, `∂z/∂σ = ε`. These estimators typically have far lower variance than the score-function estimator.\r\n- **Why distractors are wrong:** A is false (Gaussian latents are continuous). B is false; the KL term remains in the ELBO. C is unrelated.\r\n- **Interview Pro-Tip:** For discrete latents, the trick doesn't apply directly; use Gumbel-Softmax relaxations, straight-through estimators, or REINFORCE with baselines."
  }
];
