import { expect } from 'chai';
import sinon from 'sinon';
import Maybe from 'folktale/maybe';

import consent from '../';

describe('cookieConsent', function(){
  beforeEach(function(){
    const mappings = this.mappings = {
      0: 'default',
      c: 'advertising',
      c9: 'analytics',
      c11: 'support',
    };
    this.example = '0:1|c:0|c9:1|c11:0';
    const cookies = this.cookies = {
      get: () => this.example,
      set: (k, v) => this.example = v,
    };
    const hostname = this.hostname = 'he.dev.localhost.com';
    this.consent = consent(cookies, hostname)(mappings);
  });

  it('can be instantiated with no mappings', function () {
    expect(() => {
      consent();
    }).not.to.throw;
  });
  it('has a get method', function(){
    expect(typeof this.consent.get).to.equal('function');
  });
  it('has a set method', function () {
    expect(typeof this.consent.set).to.equal('function');
  });
  it('has a getByOrder method', function () {
    expect(typeof this.consent.getByOrder).to.equal('function');
  });

  describe('get', function(){
    it('returns a maybe', function () {
      const { consent, example } = this;
      const result = consent.get([ 'default' ]);

      expect(Maybe.hasInstance(result)).to.be.true;
    });
    it('returns an object', function () {
      const { consent } = this;
      const result = consent.get([ 'default' ]).getOrElse();
      expect(result).to.be.instanceof(Object);
    });
    it('returns the id and value for each category', function () {
      const { consent } = this;

      const result = consent.get([ 'default', 'advertising', 'analytics' ]).getOrElse();

      expect(result['default']).to.equal(false);
      expect(result['advertising']).to.equal(true);
      expect(result['analytics']).to.equal(false);
    });
    it('returns void for unknown/missing categories', function () {
      const { consent } = this;
      const result = consent.get([ 'default', 'support', 'extra' ]).getOrElse();

      expect(result.extra).to.equal(void 0);
    });
    it('omits non-requested categories', function () {
      const { consent } = this;
      const result = consent.get([ 'advertising' ]).getOrElse();

      expect(Object.keys(result)).to.deep.equal([ 'advertising' ]);
    });
    it('returns all categories', function () {
      const { consent } = this;
      const result = consent.get().getOrElse();

      expect(result['default']).to.equal(false);
      expect(result['advertising']).to.equal(true);
      expect(result['analytics']).to.equal(false);
      expect(result['support']).to.equal(true);
    });
  });

  describe('set', function(){
    it('stores the new values', function () {
      const expected = '0:0|c:0|c9:0|c11:1';

      this.consent.set({
        default: true,
        advertising: true,
        analytics: true,
      });

      const actual = this.example;

      expect(actual).to.equal(expected);
    });
    it('preserves existing values', function () {
      const expected = '0:1|c:0|c9:1|c11:1';

      this.consent.set({
        advertising: true,
      });

      const actual = this.example;

      expect(actual).to.equal(expected);
    });
    it('ignores invalid categories', async function () {
      const expected = '0:1|c:1|c9:1|c11:1';

      this.consent.set({
        extra: true,
      });

      const actual = this.example;

      expect(actual).to.equal(expected);
    });
  });

  describe('getByOrder', function(){
    it('returns a Maybe', function () {
      const { consent } = this;
      const result = consent.getByOrder([ 'default' ]);

      expect(Maybe.hasInstance(result)).to.be.true;
    });
    it('returns an object', function () {
      const { consent } = this;
      const result = consent.getByOrder([ 'default' ]).getOrElse();
      expect(result).to.be.instanceof(Object);
    });
    it('contains the provided keys', function () {
      const { consent } = this;
      const result = consent.getByOrder([ 'default', 'analytics' ]).getOrElse();
      expect(result.default).to.be.instanceof(Object);
      expect(result.analytics).to.be.instanceof(Object);
    });
    it('contains the id and value for each category', function () {
      const { consent } = this;

      const result = consent.getByOrder([ 'default', 'advertising', 'analytics' ]).getOrElse();

      expect(result.default.id).to.equal('0');
      expect(result.default.value).to.equal(false);
      expect(result.advertising.id).to.equal('c');
      expect(result.advertising.value).to.equal(true);
      expect(result.analytics.id).to.equal('c9');
      expect(result.analytics.value).to.equal(false);
    });
    it('returns void for unknown/missing categories', function () {
      const { consent } = this;
      const result = consent.getByOrder([ 'default', 'support', 'analytics', 'advertising', 'extra' ]).getOrElse();

      expect(result.extra).to.equal(void 0);
    });
  });
});
