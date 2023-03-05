import State from "./state";

interface ResultT<DataT> {
  loading: boolean;
  error: undefined | unknown;
  success: boolean;
  data: undefined | DataT ;
}

/**
 * A helper based on {@link State} that allows running simple asynchronous functions and
 * track their loading/error/success state.
 */
export default class PromisedSubject<DataT> extends State<ResultT<DataT>> {
  
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
  
  loading = this.derive(v => v.loading);
  hasError = this.derive(v => v.error);
  success = this.derive(v => v.success);
  data = this.derive(v => v.data);

}
