import Subject from "./subject";

interface ResultT<DataT> {
  loading: boolean;
  error: undefined | unknown;
  success: boolean;
  data: undefined | DataT ;
}

/**
 * A helper based on {@link Subject} that allows running simple asynchronous functions and
 * track their loading/error/success state.
 */
export default class PromisedSubject<DataT> extends Subject<ResultT<DataT>> {
  
  constructor(
    private asyncFunction: () => Promise<DataT>
  ) {
    super({
      loading: false,
      error: undefined,
      success: false,
      data: undefined
    });
    this._execute();
  }
  
  private async _execute() {
    try {
      this.next({...this.value, loading: true});
      const data = await this.asyncFunction();
      this.next({...this.value, data, success: true, loading: false});
      this.complete();
    } catch(e) {
      this.next({...this.value, loading: false, success: false, error: e});
    }
  }
  
  public loading = this.select(v => v.loading);
  public error = this.select(v => v.error);
  public success = this.select(v => v.success);
  public data = this.select(v => v.data);

}
