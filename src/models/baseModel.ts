export abstract class ModelBase<T, K> {
  abstract toDocumentCreate(): T;
  abstract toDocumentUpdate(): K;
}
