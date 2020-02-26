package org.jvalue.ods.adapterservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.util.Objects;

@Entity
public class DataBlob {

  @Id
  @GeneratedValue
  private Long id;

  private String data;

  public DataBlob() {
  }

  public DataBlob(String data) {
    this.data = data;
  }

  public String getData() {
    return data;
  }

  public Long getId() {
    return id;
  }

  public MetaData getMetaData() {
    return new MetaData(this);
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    DataBlob dataBlob = (DataBlob) o;
    return Objects.equals(id, dataBlob.id) &&
            Objects.equals(data, dataBlob.data);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, data);
  }

  // json representation without the actual data (as response for adapter trigger)
  public static class MetaData extends DataBlob {
    private final Long id;


    public MetaData(DataBlob dataBlob) {
      this.id = dataBlob.id;
    }
  }
}

