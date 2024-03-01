interface PipelineReturn<T> {
  then: <U>(fn: (value: T) => U) => PipelineReturn<U>;
  done: () => T;
}

/**
 * A workaround for the lack of pipeline operator in JavaScript.
 *
 * Once https://github.com/tc39/proposal-pipeline-operator is implemented, this
 * can be replaced.
 */
export function pipeline<T>(value: T): PipelineReturn<T> {
  return {
    then: <U>(fn: (value: T) => U) => pipeline(fn(value)),
    done: () => value,
  };
}
