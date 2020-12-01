import * as Settings from '../js/Settings.js';

describe("Settings", () => {

  let s;

  beforeEach(function() {

    s = new Settings.Settings({
      key1: "value1",
      key2: "value2",
      obj1: { key : "value from obj1"},
      obj2: { key : "value from obj2"}
    });
  });

  
  it("should be able to be instanciated from json", () => {

    let sAfterInit = Settings.init(s);

    expect(sAfterInit).toBe(s);

    let obj1AfterInit = Settings.init(s.obj1);

    expect(obj1AfterInit).toBe(s.obj1);

    let s2 = Settings.init({
      key1: "value1 from s2",
      key2: "value2 from s2"
    });

    expect(s2 instanceof Settings.Settings).toBeTrue();

  });

  it("should be able to provide only given values", () => {

    expect(s.key1).toBe("value1");
    expect(s.key2).toBe("value2");
    expect(s.key3).toBeUndefined();

    expect(s.obj1.key).toBe("value from obj1");
    expect(s.obj2.key).toBe("value from obj2");

    s.key1 = 'toto';
    expect(s.key1).toBe("toto");

    s.obj1.key = 'titi';
    expect(s.obj1.key).toBe("titi");

  });


  it("should be able to persist data across Settings", () => {

    expect(s.key1).toBe("value1");
    s.key1 = 'toto';
    expect(s.key1).toBe("toto");
    s.obj1.key = 'titi';
    expect(s.obj1.key).toBe("titi");
    
    let s2 = new Settings.Settings({
      key1: "value1 from s2",
      key2: "value2 from s2",
      obj1: {key : "value from s2"}
    });

    expect(s2.key1).toBe("toto");
    expect(s2.key2).toBe("value2");
    expect(s2.obj1.key).toBe("titi");

  });

  
  it("should be able to add new property with a default value", () => {

    let defaultValueForKey3 = "default value for key3";

    expect(s.key3).toBeUndefined();
    
    let notifiedValue = null;
    let val = s.listen('key3', (newVal)=>{ notifiedValue = newVal}, defaultValueForKey3);

    expect(val).toBe(defaultValueForKey3);
    expect(s.key3).toBe(defaultValueForKey3);

    s.key3 = "other value";

    expect(s.key3).toBe("other value");
    expect(notifiedValue).toBe(s.key3);

  });

  
  it("should be able to notify changes", () => {

    let notifiedChangedValue = null;
    let val = s.listen('key1', (newVal)=>{
      notifiedChangedValue = newVal;
    });

    expect(s.key1).toBe("value1");
    expect(val).toBe("value1");
    expect(notifiedChangedValue).toBeNull();

    s.key1 = 'toto';

    expect(val).toBe("value1");
    expect(s.key1).toBe("toto");
    expect(notifiedChangedValue).toBe("toto");

    //on hierarchical data
    notifiedChangedValue = null;
    val = s.obj1.listen('key', (newVal)=>{
      notifiedChangedValue = newVal;
    });

    expect(s.obj1.key).toBe("value from obj1");
    expect(val).toBe("value from obj1");
    expect(notifiedChangedValue).toBeNull();

    s.obj1.key = 'toto';

    expect(val).toBe("value from obj1");
    expect(s.obj1.key).toBe("toto");
    expect(notifiedChangedValue).toBe("toto");
  });

});
