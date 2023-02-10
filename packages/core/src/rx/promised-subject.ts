import select from "./operators/select";
import BehaviourSubject from "./behaviour-subject";

interface ResultT<DataT> {
  loading: boolean;
  error: undefined | unknown;
  success: boolean;
  data: undefined | DataT ;
}

/**
 * A helper based on {@link BehaviourSubject} that allows running simple asynchronous functions and
 * track their loading/error/success state.
 */
export default class PromisedSubject<DataT> extends BehaviourSubject<ResultT<DataT>> {
  
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
  
  public loading = this.pipe(select(v => v.loading));
  public hasError = this.pipe(select(v => v.error));
  public success = this.pipe(select(v => v.success));
  public data = this.pipe(select(v => v.data));

}
