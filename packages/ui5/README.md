This is a wrapper around the
[SAP UI5 Web Components](https://sap.github.io/ui5-webcomponents/).

### Why Wrap an External Library?

Even if Mvui would evetually get its own standard library of components, it is highly
unlikely that this will ever reach the level of a more professionaly made ui library in
terms of having a consistent design language, accessibility, themes and complex widgets
like datepickers.

### Why UI5?

Looking through various lists on webcomponent libraries on the internet such as [this
one](https://sap.github.io/ui5-webcomponents/), one quickly finds that a lot of them are
either unmaintained or simply do not have that many downloads/stars. UI5 seems to get a
reasonable amount of use and should be around for quite a long time since it explicitly
targets enterprise users.

Filtering the list of libraries to ones which most would deem decently future proof, there
would have been only two alternatives:

- Vaadin Web Components: These seem nice, but they seem to (understandably) focus [their
  docs](https://vaadin.com/docs/latest/components) very heavily on their own framework
  rather then on how to use their components as "normal" web components. They do have an
  [api reference](https://cdn.vaadin.com/vaadin-web-components/23.3.5/) site which is more
  tailored to that purpose, but this one is lacking any examples or images and is hidden
  behind several links. Overall, vaadin web components seem nice, but their (again,
  understandable) focus on their own framework leaves one wondering about the present and
  future dx.
- Ionic Components: These also seem very nice and [their
  documentation](https://ionicframework.com/docs/components) is presented in a framework
  neutral way, but they do seem to focus heavily on mobile app development. This is not a
  priority for the apps that I (@dominiksta) want to build right now, so for the time
  being UI5 seemed like the nicest option.

