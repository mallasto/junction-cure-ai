FROM public.ecr.aws/lambda/python:3.9

# Install the function's dependencies using file requirements.txt
# from your project folder.

COPY requirements.txt  .
RUN  pip3 install -r requirements.txt --no-cache-dir --target "${LAMBDA_TASK_ROOT}"

# Copy function code
COPY models/instructor-base ${LAMBDA_TASK_ROOT}/models/instructor-base
COPY app.py ${LAMBDA_TASK_ROOT}
COPY utils.py ${LAMBDA_TASK_ROOT}
COPY llm.py ${LAMBDA_TASK_ROOT}
COPY openai_utils.py ${LAMBDA_TASK_ROOT}
COPY embedding_utils.py ${LAMBDA_TASK_ROOT}
COPY assets ${LAMBDA_TASK_ROOT}/assets
COPY .env ${LAMBDA_TASK_ROOT}

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "app.handler" ]