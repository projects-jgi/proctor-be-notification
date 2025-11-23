export type KafkaExamMessage = {
    resource_url: string;
    resource_path: string;
    attempt_id: number,
    exam_id: number
};