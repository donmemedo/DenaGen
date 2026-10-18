from genome import parse_raw, sample_raw

RAW = """# build 37
rsid\tchromosome\tposition\tgenotype
rs4988235\t2\t136608646\tGA
rs12913832\t15\t28365618\tGG
rs1\t1\t100\t--
rs2\t23\t200\tCT
rs3\tMT\t300\tA
"""


def test_parse():
    r = parse_raw(RAW)
    assert (r["total"], r["called"], r["no_calls"], r["build"]) == (5, 4, 1, "GRCh37")
    assert r["heterozygosity"] == 50.0  # GA, CT het; GG, A not
    chroms = {c["name"]: c["snps"] for c in r["chromosomes"]}
    assert chroms["X"] == 1 and chroms["MT"] == 1
    traits = {t["id"]: t for t in r["traits"]}
    assert traits["lactose"]["genotype"] == "AG" and traits["lactose"]["result"]["level"] == 2
    assert traits["eyes"]["result"]["en"] == "Likely blue"
    assert traits["caffeine"]["result"] is None


def test_sample_roundtrip():
    r = parse_raw(sample_raw(seed=1))
    assert r["total"] > 7000 and all(t["result"] for t in r["traits"])


if __name__ == "__main__":
    test_parse()
    test_sample_roundtrip()
    print("ok")
