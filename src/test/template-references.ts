import Component from "component";
import Html from "html";

export class TemplateReferencesTest1 extends Component {

  private paragraphEl = this.query<HTMLParagraphElement>('.myClass');
  private listEls = this.queryAll<HTMLParagraphElement>('.myListEl');

  async onRender() {
    (await this.paragraphEl).innerText = 'Programatically added content';
    for (let el of (await this.listEls)) {
      el.innerText = 'Multiple query';
      el.style.textDecoration = 'underline';
    }
  }

  render = () => [
    Html.FieldSet([
      Html.Legend('Template References'),
      Html.P({ attrs: { class: 'myClass' } }),
      Html.Ul([
        Html.Li({ attrs: { class: 'myListEl' }}),
        Html.Li({ attrs: { class: 'myListEl' }}),
        Html.Li({ attrs: { class: 'myListEl' }}),
      ])
    ])
  ]
}
TemplateReferencesTest1.register();


export class TemplateReferencesTest2 extends Component {

  render = () => [
    Html.FieldSet([
      Html.Legend('Template References'),
      Html.P(
        'This component contains elements with same css classes as another ' +
        'component, so if the shadow were not working the elements here would ' +
        'be populated and styled'
      ),
      Html.P({ attrs: { class: 'myClass' } }),
      Html.Ul([
        Html.Li({ attrs: { class: 'myListEl' }}),
        Html.Li({ attrs: { class: 'myListEl' }}),
        Html.Li({ attrs: { class: 'myListEl' }}),
      ])
    ])
  ]
}
TemplateReferencesTest2.register();
