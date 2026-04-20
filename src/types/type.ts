export type KafkaExamMessage = {
  resource_url: string;
  resource_path: string;
  attempt_id: number;
  exam_id: number;
};

export type KafkaExamAttemptFrameMessage = {
  exam_id: number;
  attempt_id: number;
  image_url: string;
  image_key: string;
  external_image_url: string;
};
