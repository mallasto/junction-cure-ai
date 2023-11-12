# Labradoodle.ai
An Encouraging Therapy Journal

## Problem
Documenting your journey towards a better mental place is tough. With the use of a large language model (LLM) powered therapy journal, we wish to encourage the patient to document their process and experiences and improve the information exchange to the healthcare experts. On one hand, this is done by providing the users with feedback to improve the way they process their experiences with the journal. On the other hand, we help the experts by providing insights on the patients' writing.


## Real-World Impact
We make journaling more engaging and mining for insights more efficient. This way, we encourage patient commitment to their care, as well as empowering the health care professionals to focus on what they do best: providing diagnoses and treatment via humane patient interaction.

## Technologies
Our model relies on LLMs (in practice, [OpenAI gpt-3.5-turbo](https://platform.openai.com/docs/models/gpt-3-5)) to provide the feedback and insights on the journal. With [in-context learning](https://en.wikipedia.org/wiki/Prompt_engineering#In-context_learning) and well-defined [output schemata](https://wandb.ai/jxnlco/function-calls/reports/Better-Data-Extraction-Using-Pydantic-and-OpenAI-Function-Calls--Vmlldzo0ODU4OTA3#solution-2:-openaischema-powered-by-pydantic), we both ground the model to expert documents ([rubrics for feedback](https://github.com/mallasto/junction-cure-ai/blob/main/llm-api/app/assets/rubric.json), [symptoms and their descriptions for insights](https://github.com/mallasto/junction-cure-ai/blob/main/llm-api/app/assets/symptoms.json)), as well as to the journal on the word-level by utilizing exact excerpts from the journal entries.

The previous approach is to show what is possible now with the state of the art. To align our solution with the sustainability criterion of the challenge, we implemented another version relying on [Instructor Embeddings](https://huggingface.co/hkunlp/instructor-large). The model embeds both the user journal (on sentence-level) as well as the rubrics and symptom descriptions. We then cross-reference these elements with cosine similarity to provide the feedback and insights. Unfortunately, this approach does not allow generating personalised feedback or summaries, but it manages to provide to find related symptoms and rubric criteria.

As text-embedding models are clearly smaller than capable LLMs (millions of parameters, not billions), and for retrieval we only need inner-product, this approach is more sustainable. Unfortunately, though, we witnessed degraded performance compared to the LLM approach, as well as losing the ability to generate personalised feedback.

An alternative would have been to look into smaller [open-source LLMs](https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard). Unfortunately, there were two major restrictions to why we decided not to explore this direction:
* Deploying these models for inference is not trivial.
* We are not aware of API calling fine-tuned open-source LLMs  for structured output.
* Fine-tuning our own model was out of scope for this project, but with more time and resources would definitely be a possibility.

See more in our [github](https://github.com/mallasto/junction-cure-ai/tree/main/llm-api/app)!

## Future Possibilities
The journey is just beginning, and the future holds exciting possibilities:
* **Actionable Recommendations.** Lower the patients' threshold to take actions towards their improved well-being by providing actionable recommendations based on their data and preferences. 
* **Integration with Wearables.** Stay better informed of the patients' journey by integrating with popular health wearables, allowing users to seamlessly incorporate data from devices like fitness trackers and smartwatches into their records.
* **Population-Level Insights.** Help professionals research therapeutic journals by processing the structured data gathered by our intelligent platforms. Find out the effectiveness of treatment plans through the insights parsed  from thousands of patient journals.


### Demo Videos
[Landing Page](https://drive.google.com/file/d/1gBFoX3P1g-bjT9KU8apr1vPkgozYEkx6/view?usp=sharing)
[Patient View](https://drive.google.com/file/d/17UKtu1MBV-c65NLOha7J4LiTh5Eiubc3/view?usp=sharing)
[Therapist View](https://drive.google.com/file/d/10hTJ40iFYqY08NAf-x9LU2gAqawQ5_aT/view?usp=sharing)