var should = require('should/as-function');

var RDFS;
try {
    RDFS = require('../dist/lib/index');
}
catch (error) {
    RDFS = require('rdfs');
}

describe('BindingProperty', function () {
    describe('#property', function () {
        it('should return related property', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/'
                }
            );

            var resource = model.rdfsResource();

            var bindingProperty = resource.get(RDFS.IRI_RDF_TYPE);

            var rdfType = bindingProperty.property;

            should(rdfType).have.property('IRI');
            should(rdfType.toString()).equal('Resource <' + RDFS.IRI_RDF_TYPE + '>');

            done();
        });
    });

    describe('#size', function () {
        it('should return count of values', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/'
                }
            );

            var resource = model.rdfsResource();

            var bindingProperty = resource.get(RDFS.IRI_RDF_TYPE);

            should(bindingProperty.size).equal(1);

            done();
        });
    });

    describe('#set(value)', function () {
        it('should add value', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/'
                }
            );

            var resource = model.rdfsResource('this-example');
            resource.set('dc:creator', 'Qfield');

            var bp = resource.get('dc:creator');

            bp.set('Q-field')
                .set(['qfield.net', 'q-field.net']);

            var expectedValues = [
                'Qfield', 'Q-field', 'qfield.net', 'q-field.net'
            ];
            var values = [];
            var count = 0;

            bp.forEach(function (value) {
                values.push(value);
                count += 1;
            });

            should(count).equal(expectedValues.length);

            should(values).containDeep(expectedValues);
            should(expectedValues).containDeep(values);

            done();
        });
    });

    describe('#has(value)', function () {
        it('should return true if literal exists', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/'
                }
            );

            var resource = model.rdfsResource('this-example');
            resource.set('dc:creator', 'Qfield');
            resource.set('dc:creator', model.rdfLangString('q-field@en-us'));

            var bp = resource.get('dc:creator');

            should(bp.has('Q-field')).be.false();
            should(bp.has('Qfield')).be.true();
            should(bp.has('q-field')).be.true();
            should(bp.has(model.rdfLangString('q-field@en-gb'))).be.false();
            should(bp.has(model.rdfLangString('q-field@en-us'))).be.true();

            done();
        });

        it('should return true if resource exists', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/'
                }
            );

            var resource = model.rdfsResource('this-example');
            var format = model.rdfsClass('text/javascript');
            resource.set('dc:format', format);

            var bp = resource.get('dc:format');

            should(bp.has(format)).be.true();
            should(bp.has(model.rdfsResource())).be.false();

            done();
        });
    });

    describe('#get([valueIRI])', function () {
        it('should return single value when no valueIRI specified', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/'
                }
            );

            var resource = model.rdfsResource('this-example');
            resource.set('dc:creator', 'Qfield');

            var bp = resource.get('dc:creator');
            should(bp.get()).equal('Qfield');

            resource.set('dc:creator', 'Q-field');

            should(function () {
                bp.get();
            }).throw(Error);

            done();
        });

        it('should return resource when specified valueIRI', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/'
                }
            );

            var resource = model.rdfsResource('this-example');
            var format = model.rdfsClass('text/javascript');
            resource.set('dc:format', format);

            var bp = resource.get('dc:format');
            should(bp.get('text/javascript')).equal(format);

            done();
        });

        it('should return literal when specified valueIRI as an index number', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/'
                }
            );

            var resource = model.rdfsResource('this-example');
            var format = model.rdfsClass('text/javascript');
            resource.set('dc:format', format);
            resource.set('dc:format', 'text/javascript');
            resource.set('dc:format', 'application/ld+json');

            var bp = resource.get('dc:format');
            should(bp.get(0)).not.equal(format);
            should(bp.get(0)).equal('text/javascript');
            should(bp.get(1)).equal('application/ld+json');

            done();
        });
    });

    describe('#delete([value])', function () {
        it('should remove all values when no value specified', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/'
                }
            );

            var resource = model.rdfsResource('this-example');
            var format = model.rdfsClass('text/javascript');
            resource.set('dc:format', format);
            resource.set('dc:format', 'text/javascript');
            resource.set('dc:format', 'application/ld+json');

            var bp = resource.get('dc:format');

            should(bp.size).equal(3);

            bp.delete();

            should(bp.size).equal(0);

            done();
        });

        it('should remove resource when value specified as a rdfs:Resource', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/'
                }
            );

            var resource = model.rdfsResource('this-example');
            var format = model.rdfsClass('text/javascript');
            resource.set('dc:format', format);
            resource.set('dc:format', 'text/javascript');
            resource.set('dc:format', 'application/ld+json');

            var bp = resource.get('dc:format');

            should(bp.delete(format)).be.true();
            should(bp.has('text/javascript')).be.true();
            should(bp.has(format)).be.false();

            done();
        });

        it('should remove literal when value specified as a primitive value or a literal resource', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/'
                }
            );

            var resource = model.rdfsResource('this-example');
            var format = model.rdfsClass('text/javascript');
            resource.set('dc:creator', 'Qfield');
            resource.set('dc:creator', model.rdfLangString('q-field@en-us'));
            resource.set('dc:creator', model.rdfLangString('q-field@en-ca'));
            resource.set('dc:creator', model.rdfLangString('q-field@en-au'));
            resource.set('dc:format', format);
            resource.set('dc:format', 'text/javascript');
            resource.set('dc:format', 'application/ld+json');

            var bp = resource.get('dc:format');

            should(bp.delete('text/javascript')).be.true();
            should(bp.has('text/javascript')).be.false();
            should(bp.has(format)).be.true();

            bp = resource.get('dc:creator');

            should(bp.delete(model.rdfLangString('q-field@en-bg'))).be.false();
            should(bp.has('q-field')).be.true();

            should(bp.delete(model.rdfLangString('q-field@en-ca'))).be.true();
            should(bp.has(model.rdfLangString('q-field@en-ca'))).be.false();
            should(bp.has('q-field')).be.true();

            should(bp.delete('q-field')).be.true();
            should(bp.has('q-field')).be.true();

            should(bp.delete('q-field')).be.true();
            should(bp.has('q-field')).be.false();

            done();
        });
    });

    describe('#some(callback)', function () {
        it('should return all values', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/'
                }
            );

            var resource = model.rdfsResource('this-example');
            var format = model.rdfsClass('text/javascript');
            resource.set('dc:format', format);
            resource.set('dc:format', 'text/javascript');
            resource.set('dc:format', 'application/ld+json');

            var values = [];
            var expectedValues = [
                'text/javascript',
                'application/ld+json',
                format
            ];

            var bp = resource.get('dc:format');

            should(bp.some(function (value) {
                values.push(value);
            })).be.false();

            should(expectedValues).containDeep(values);
            should(values).containDeep(expectedValues);

            done();
        });

        it('should break if callback returns true', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/'
                }
            );

            var resource = model.rdfsResource('this-example');
            var format = model.rdfsClass('text/javascript');
            resource.set('dc:format', format);
            resource.set('dc:format', 'text/javascript');
            resource.set('dc:format', 'application/ld+json');

            var values = [];
            var expectedValues = [
                'text/javascript',
                'application/ld+json',
                format
            ];

            var bp = resource.get('dc:format');

            should(bp.some(function (value) {
                var result = (value === expectedValues[0]);
                if (result === true) {
                    values.push(value);
                }
                else {
                    result = undefined;
                }
                return (result);
            })).be.true();

            should(values).have.length(1);
            should(values[0]).equal(expectedValues[0]);

            done();
        });
    });

    describe('#every(callback)', function () {
        it('should return all values', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/'
                }
            );

            var resource = model.rdfsResource('this-example');
            var format = model.rdfsClass('text/javascript');
            resource.set('dc:format', format);
            resource.set('dc:format', 'text/javascript');
            resource.set('dc:format', 'application/ld+json');

            var values = [];
            var expectedValues = [
                'text/javascript',
                'application/ld+json',
                format
            ];

            var bp = resource.get('dc:format');

            should(bp.every(function (value) {
                values.push(value);
                return (true);
            })).be.true();

            should(expectedValues).containDeep(values);
            should(values).containDeep(expectedValues);

            done();
        });

        it('should break if callback returns not true', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/'
                }
            );

            var resource = model.rdfsResource('this-example');
            var format = model.rdfsClass('text/javascript');
            resource.set('dc:format', format);
            resource.set('dc:format', 'text/javascript');
            resource.set('dc:format', 'application/ld+json');

            var values = [];
            var expectedValues = [
                'text/javascript',
                'application/ld+json',
                format
            ];

            var bp = resource.get('dc:format');

            should(bp.every(function (value) {
                var result = (value !== expectedValues[0]);
                if (result === true) {

                }
                else {
                    values.push(value);
                    result = undefined;
                }
                return (result);
            })).be.false();

            should(values).have.length(1);
            should(values[0]).equal(expectedValues[0]);

            done();
        });
    });

    describe('#forEach(callback)', function () {
        it('should return all values', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/'
                }
            );

            var resource = model.rdfsResource('this-example');
            var format = model.rdfsClass('text/javascript');
            resource.set('dc:format', format);
            resource.set('dc:format', 'text/javascript');
            resource.set('dc:format', 'application/ld+json');

            var values = [];
            var expectedValues = [
                'text/javascript',
                'application/ld+json',
                format
            ];

            var bp = resource.get('dc:format');

            bp.forEach(function (value) {
                values.push(value);
            });

            should(expectedValues).containDeep(values);
            should(values).containDeep(expectedValues);

            done();
        });
    });

    describe('#toJSON()', function () {
        it('should return values as JSONLD document part', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/'
                }
            );

            var resource = model.rdfsResource('this-example');
            var format = model.rdfsClass('text/javascript');
            resource.set('dc:format', format);
            resource.set('dc:format', 'text/javascript');
            resource.set('dc:format', 'application/ld+json');

            var bp = resource.get('dc:format');
            var jsonldDocPart = bp.toJSON();
            var expectedDocPart = [
                {
                    "@id": "http://qfield.net/example/ns#text/javascript",
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": {
                        "@id": "http://www.w3.org/2000/01/rdf-schema#Class",
                        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": {
                            "@id": "http://www.w3.org/2000/01/rdf-schema#Class"
                        }
                    }
                },
                "text/javascript",
                "application/ld+json"
            ];

            should(jsonldDocPart).containDeep(expectedDocPart);
            should(expectedDocPart).containDeep(jsonldDocPart);

            done();
        });
    });

    describe('#valueOf()', function () {
        it('should return bound value when property binds with only one value', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/'
                }
            );

            var resource = model.rdfsResource('this-example');
            resource.set('dc:format', 'text/javascript');

            var bp = resource.get('dc:format');
            should(bp.valueOf()).equal('text/javascript');
            should(bp.valueOf()).equal(bp.get().valueOf());

            bp.set('application/javascript');
            should(bp.valueOf()).equal(bp);

            done();
        });
    });

    describe('#toString()', function () {
        it('should return "BindingProperty <...> [...]"', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/'
                }
            );

            var resource = model.rdfsResource('this-example');
            var format = model.rdfsClass('text/javascript');
            resource.set('dc:format', format);
            resource.set('dc:format', 'text/javascript');
            resource.set('dc:format', 'application/ld+json');

            var bp = resource.get('dc:format');
            var value = bp.toString();
            var expectedValue = 'BindingProperty <http://purl.org/dc/elements/1.1/format> [';

            should(value).startWith(expectedValue);
            should(value).endWith(']');
            should(value.indexOf('Resource <http://qfield.net/example/ns#text/javascript>') > 0).be.true();
            should(value.indexOf(' text/javascript') > 0).be.true();
            should(value.indexOf(' application/ld+json') > 0).be.true();

            done();
        });
    });
});
